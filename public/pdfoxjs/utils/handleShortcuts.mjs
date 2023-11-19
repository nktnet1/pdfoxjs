import { PDFViewerApplication } from '../components/application.mjs';

const getActionFromKey = (keys, commands, config) => {
  for (const command of commands) {
    if (keys[keys.length - 1] === command) {
      return config.commands[command];
    }

    const cmdKeys = command.split(config.settings.commandSeparator);

    if (keys.length < cmdKeys.length) {
      continue;
    }

    for (let i = keys.length - 1; i >= 0; --i) {
      const s = cmdKeys.pop();
      if (keys[i] !== s) {
        break;
      }

      if (cmdKeys.length === 0) {
        return config.commands[command];
      }
    }
  }
  return null;
};

export const handleShortcuts = (config, { toggleHelp }) => {
  const SCROLL_AMOUNT = config.settings.scrollAmount;

  const container = PDFViewerApplication.pdfViewer.container;

  let scrollRequestId = null;

  const scrollBy = (x, y) => {
    if (scrollRequestId === null) {
      const start = performance.now();
      const step = (timestamp) => {
        const elapsed = timestamp - start;
        container.scrollBy({
          behavior: 'auto',
          left: x,
          top: y,
        });
        scrollRequestId = elapsed < 1000 ? window.requestAnimationFrame(step) : null;
      };
      scrollRequestId = window.requestAnimationFrame(step);
    }
  };

  const scrollTo = (top) => container.scrollTo({ behavior: 'smooth', top });

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

  const actionMap = {
    'scroll-down': () => scrollBy(0, SCROLL_AMOUNT),
    'scroll-up': () => scrollBy(0, -SCROLL_AMOUNT),
    'scroll-left': () => scrollBy(SCROLL_AMOUNT, 0),
    'scroll-right': () => scrollBy(-SCROLL_AMOUNT, 0),
    'scroll-to-top': () => scrollTo(0),
    'scroll-to-bottom': () => scrollTo(container.scrollHeight),
    'trigger-search': () => PDFViewerApplication.findBar.open(),
    'toggle-sidebar': toggleSidebar,
    'toggle-toolbar': toggleToolbar,
    'toggle-help': toggleHelp,
  };

  const keys = [];
  const append = (key) => {
    keys.push(key);
    if (keys.length > config.settings.maxCommandLength) {
      keys.shift();
    }
  };
  const commands = Object.keys(config.commands).sort((a, b) => b.length - a.length);
  container.addEventListener('keydown', (event) => {
    append(event.key);
    const action = getActionFromKey(keys, commands, config);
    if (action !== null) {
      event.stopPropagation();
      event.preventDefault();
      actionMap[action]();
      keys.length = 0;
    }
  });

  container.addEventListener('keyup', () => {
    if (scrollRequestId !== null) {
      window.cancelAnimationFrame(scrollRequestId);
      scrollRequestId = null;
    }
  });
};
