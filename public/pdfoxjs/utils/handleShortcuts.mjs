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

export const handleShortcuts = (config, { toggleHelp }) => {
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

  const toolbar = document.getElementById('toolbarContainer');
  const viewerContainer = document.getElementById('viewerContainer');

  const toggleToolbar = () => {
    const result = toolbar.classList.toggle('hidden');
    if (result) {
      viewerContainer.classList.add('noInset');
      PDFViewerApplication.pdfSidebar.close();
    } else {
      viewerContainer.classList.remove('noInset');
    }
  };

  const toggleSidebar = () => {
    if (!toolbar.classList.contains('hidden')) {
      PDFViewerApplication.pdfSidebar.toggle();
    } else {
      // Open toolbar before sidebar
      toolbar.classList.remove('hidden');
      viewerContainer.classList.remove('noInset');
      PDFViewerApplication.pdfSidebar.open();
    }
  };

  const makeScrollConfig = (settings, multiplier = 1, direction = 'top') => {
    return {
      [direction]: (settings?.scrollAmount ?? config.settings.globalScrollAmount) * multiplier,
      behavior: settings?.scrollBehavior ?? config.settings.globalScrollBehavior
    };
  };

  const commandMap = {
    'toggle-help': toggleHelp,
    'scroll-down': (settings) => scrollBy(makeScrollConfig(settings)),
    'scroll-up': (settings) => scrollBy(makeScrollConfig(settings, -1)),
    'scroll-left': (settings) => scrollBy(makeScrollConfig(settings, 1, 'left')),
    'scroll-right': (settings) => scrollBy(makeScrollConfig(settings, -1, 'left')),
    'scroll-to-top': (settings) => container.scrollTo(makeScrollConfig({ ...settings, scrollAmount: 0 })),
    'scroll-to-bottom': (settings) => container.scrollTo(makeScrollConfig({ ...settings, scrollAmount: container.scrollHeight })),
    'trigger-search': () => PDFViewerApplication.findBar.open(),
    'toggle-sidebar': toggleSidebar,
    'toggle-toolbar': toggleToolbar,
    'zoom-in': (settings) => (PDFViewerApplication.pdfViewer.currentScale += settings.zoomAmount ?? config.settings.globalZoomAmount),
    'zoom-out': (settings) => (PDFViewerApplication.pdfViewer.currentScale -= settings.zoomAmount ?? config.settings.globalZoomAmount),
    'zoom-reset': () => (PDFViewerApplication.pdfViewer.currentScale = 1),
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
