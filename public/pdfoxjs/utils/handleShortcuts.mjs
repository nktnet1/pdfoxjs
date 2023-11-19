import { PDFViewerApplication } from '../components/application.mjs';

const getActionFromKey = (inputKeys, commandKeys, config) => {
  for (const commandKey of commandKeys) {
    if (inputKeys[inputKeys.length - 1] === commandKey) {
      return config.keys[commandKey];
    }
    const cmdKeys = commandKey.split(config.settings.keysSeparator);
    if (inputKeys.length < cmdKeys.length) {
      continue;
    }
    for (let i = inputKeys.length - 1; i >= 0; --i) {
      const s = cmdKeys.pop();
      if (inputKeys[i] !== s) {
        break;
      }
      if (cmdKeys.length === 0) {
        return config.keys[commandKey];
      }
    }
  }
  return { command: null };
};

export const handleShortcuts = (config, { toggleHelp, toggleToolbar, toggleSidebar, closeAnnotationEditor }) => {
  const container = PDFViewerApplication.pdfViewer.container;

  let scrollRequestId = null;

  const scrollBy = ({ behavior, left, top }) => {
    if (scrollRequestId === null) {
      const start = performance.now();
      const step = (timestamp) => {
        const elapsed = timestamp - start;
        container.scrollBy({ behavior, left, top });
        scrollRequestId = elapsed < 1000 ? window.requestAnimationFrame(step) : null;
      };
      scrollRequestId = window.requestAnimationFrame(step);
    }
  };

  const makeScrollConfig = (settings, multiplier = 1, direction = 'top') => {
    return {
      [direction]: (settings?.scrollAmount ?? config.settings.globalScrollAmount) * multiplier,
      behavior: settings?.scrollBehavior ?? config.settings.globalScrollBehavior
    };
  };

  const toggleEditorMode = (mode) => {
    if (PDFViewerApplication.pdfViewer.annotationEditorMode !== mode) {
      PDFViewerApplication.eventBus.dispatch('switchannotationeditormode', { mode });
    } else {
      closeAnnotationEditor();
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
    // FIXME: Remove shortcuts when editing text
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
  const append = (key) => {
    inputKeys.push(key);
    if (inputKeys.length > config.settings.maxCommandLength) {
      inputKeys.shift();
    }
  };
  const commandKeys = Object.keys(config.keys).sort((a, b) => b.length - a.length);
  container.addEventListener('keydown', (event) => {
    append(event.key);
    const { command, settings } = getActionFromKey(inputKeys, commandKeys, config);
    if (command !== null) {
      event.stopPropagation();
      event.preventDefault();
      commandMap[command](settings ?? {});
      inputKeys.length = 0;
    }
  });

  container.addEventListener('keyup', () => {
    if (scrollRequestId !== null) {
      window.cancelAnimationFrame(scrollRequestId);
      scrollRequestId = null;
    }
  });
};
