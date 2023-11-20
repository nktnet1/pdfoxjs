import { PDFViewerApplication } from '../components/application.mjs';

const PDF_INTERNAL_EDITOR_INPUT_REGEX = /pdfjs_internal_editor_[0-9]+-editor/;
const MODIFIER_KEYS = ['Shift', 'Control', 'Alt', 'Meta'];

const getCommandKey = (inputKeys, commandKeys, separator) => {
  for (const commandKey of commandKeys) {
    if (inputKeys[inputKeys.length - 1] === commandKey) {
      return commandKey;
    }
    const cmdKeys = commandKey.split(separator);
    if (inputKeys.length < cmdKeys.length) {
      continue;
    }
    for (let i = inputKeys.length - 1; i >= 0; --i) {
      const s = cmdKeys.pop();
      if (inputKeys[i] !== s) {
        break;
      }
      if (cmdKeys.length === 0) {
        return commandKey;
      }
    }
  }
  return null;
};

export const handleShortcuts = (config, { toggleHelp, toggleToolbar, toggleSidebar, closeAnnotationEditor }) => {
  const container = PDFViewerApplication.pdfViewer.container;

  let scrollRequestId = null;
  container.addEventListener('keyup', () => {
    if (scrollRequestId === null) {
      return;
    }
    window.cancelAnimationFrame(scrollRequestId);
    scrollRequestId = null;
  });

  const scrollBy = ({ behavior, left, top }) => {
    if (scrollRequestId === null) {
      const start = performance.now();
      const step = (timestamp) => {
        const elapsed = timestamp - start;
        container.scrollBy({ behavior, left, top });
        scrollRequestId = elapsed < 800 ? window.requestAnimationFrame(step) : null;
      };
      scrollRequestId = window.requestAnimationFrame(step);
    }
  };

  const makeScrollConfig = (settings, multiplier = 1, direction = 'top') => ({
    [direction]: (settings.scrollAmount ?? config.settings.globalScrollAmount) * multiplier,
    behavior: settings.scrollBehavior ?? config.settings.globalScrollBehavior
  });

  const toggleEditorMode = (mode) =>
    PDFViewerApplication.pdfViewer.annotationEditorMode !== mode
      ? PDFViewerApplication.eventBus.dispatch('switchannotationeditormode', { mode })
      : closeAnnotationEditor();

  const scrollToPage = ({ behavior }, pageNumber) => {
    const pageIndex = Math.min(PDFViewerApplication.pagesCount, pageNumber) - 1;
    const pageView = PDFViewerApplication.pdfViewer.getPageView(pageIndex);
    const element = pageView.div;
    element.scrollIntoView({ behavior });
  };

  const scrollHalfPage = (settings, multiplier) => {
    const pageView = PDFViewerApplication.pdfViewer.getPageView(0);
    if (pageView) {
      const scrollAmount = (pageView.viewport.height * multiplier) / 2;
      container.scrollBy({ behavior: settings.scrollBehavior, top: scrollAmount });
    }
  };

  const commandMap = {
    'toggle-help': toggleHelp,
    'scroll-down': (settings) => scrollBy(makeScrollConfig(settings)),
    'scroll-up': (settings) => scrollBy(makeScrollConfig(settings, -1)),
    'scroll-left': (settings) => scrollBy(makeScrollConfig(settings, 1, 'left')),
    'scroll-right': (settings) => scrollBy(makeScrollConfig(settings, -1, 'left')),
    'scroll-to-top': (settings) => container.scrollTo(makeScrollConfig({ ...settings, scrollAmount: 0 })),
    'scroll-to-bottom': (settings) => container.scrollTo(makeScrollConfig({ ...settings, scrollAmount: container.scrollHeight })),
    'scroll-to-page': (settings, pageNumber) => scrollToPage(makeScrollConfig(settings), pageNumber),
    'scroll-half-page-up': (settings) => scrollHalfPage(settings, -1),
    'scroll-half-page-down': (settings) => scrollHalfPage(settings, 1),

    'toggle-toolbar': toggleToolbar,
    'toggle-sidebar': toggleSidebar,
    'trigger-search': () => PDFViewerApplication.findBar.open(),
    'next-page': () => PDFViewerApplication.eventBus.dispatch('nextpage'),
    'focus-page-number': () => PDFViewerApplication.appConfig.toolbar.pageNumber.focus(),
    'previous-page': () => PDFViewerApplication.eventBus.dispatch('previouspage'),
    'zoom-in': (settings) => (PDFViewerApplication.pdfViewer.currentScale += settings.zoomAmount ?? config.settings.globalZoomAmount),
    'zoom-out': (settings) => (PDFViewerApplication.pdfViewer.currentScale -= settings.zoomAmount ?? config.settings.globalZoomAmount),
    'zoom-reset': () => (PDFViewerApplication.pdfViewer.currentScale = 1),
    'open-file': () => PDFViewerApplication.eventBus.dispatch('openfile'),
    'print-pdf': () => PDFViewerApplication.eventBus.dispatch('print'),
    'save-pdf': () => PDFViewerApplication.save(),
    'toggle-insert-text': () => toggleEditorMode(globalThis.pdfjsLib.AnnotationEditorType.FREETEXT),
    'toggle-draw': () => toggleEditorMode(globalThis.pdfjsLib.AnnotationEditorType.INK),
    'toggle-insert-image': () => toggleEditorMode(globalThis.pdfjsLib.AnnotationEditorType.STAMP),
    'toggle-secondary-toolbar': () => PDFViewerApplication.secondaryToolbar.toggle(),

    'rotate-clockwise': () => PDFViewerApplication.eventBus.dispatch('rotatecw'),
    'rotate-counterclockwise': () => PDFViewerApplication.eventBus.dispatch('rotateccw'),
    'first-page': () => PDFViewerApplication.eventBus.dispatch('firstpage'),
    'last-page': () => PDFViewerApplication.eventBus.dispatch('lastpage'),
    'show-document-info': () => PDFViewerApplication.eventBus.dispatch('documentproperties'),
    'no-action': () => { /* nothing to do */ },
  };

  const inputKeys = [];
  const numberBuffer = [];

  // Tracks only the last maxCommandkeysLength in the array
  const append = (key) => inputKeys.push(key) > config.settings.maxCommandKeysLength && inputKeys.shift();

  const commandKeys = Object.keys(config.keys).sort((a, b) => b.length - a.length);
  container.addEventListener('keydown', (event) => {
    if (PDF_INTERNAL_EDITOR_INPUT_REGEX.test(document.activeElement.id)) {
      // Inside input box for editor
      return;
    }

    if (MODIFIER_KEYS.includes(event.key)) {
      return;
    }

    if (/^[0-9]$/.test(event.key)) {
      numberBuffer.push(event.key);
      return;
    }

    append(event.key);

    const prefix = numberBuffer.length > 0 ? config.settings.numberPrefix : '';
    const commandKey = getCommandKey(
      inputKeys,
      commandKeys.map(ck => ck.startsWith(prefix) ? ck.substring(prefix.length) : ck),
      config.settings.keysSeparator
    );

    const action = config.keys[prefix + commandKey] ?? config.keys[commandKey];
    if (action === undefined) {
      numberBuffer.length = 0;
      return;
    }

    const { command, settings } = action;

    event.stopPropagation();
    event.preventDefault();
    inputKeys.length = 0;

    if (numberBuffer.length === 0) {
      return commandMap[command](settings ?? {});
    }

    const commandRepeat = parseInt(numberBuffer.join('')) || 1;
    numberBuffer.length = 0;

    if (command === 'scroll-to-page') {
      return scrollToPage(makeScrollConfig(settings), commandRepeat);
    }

    for (let i = 0; i < commandRepeat; ++i) {
      commandMap[command](settings ?? {});
    }
  });
};
