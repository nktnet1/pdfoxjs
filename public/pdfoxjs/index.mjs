import { PDFViewerApplication } from './components/application.mjs';
import { createFloatingDiv } from './components/floatingDiv.mjs';
import { createHelpButton } from './components/helpButton.mjs';
import { createUploadButton } from './components/uploadButton.mjs';
import { createChildElement } from './utils/creation.mjs';
import { getActionFromKey } from './utils/handleShortcuts.mjs';

const createCustomElements = () => {
  // stylesheet
  createChildElement(
    document.head,
    'link',
    {
      rel: 'stylesheet',
      type: 'text/css',
      href: '../../pdfoxjs/index.css',
    }
  );

  const floatingDiv = createFloatingDiv();
  PDFViewerApplication.eventBus?.on('pagesloaded', () => {
    floatingDiv.style.display = 'none';
  });

  createUploadButton(floatingDiv);
  const { isOpen, openPopup, closePopup } = createHelpButton(floatingDiv);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      PDFViewerApplication.pdfViewer.container.focus();
      isOpen() && closePopup();
    }
  });

  const toggleHelp = () => isOpen() ? closePopup() : openPopup();
  return { toggleHelp };
};

const handleShortcuts = (config, { toggleHelp }) => {
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

  const actionMap = {
    'scroll-down': () => scrollBy(0, SCROLL_AMOUNT),
    'scroll-up': () => scrollBy(0, -SCROLL_AMOUNT),
    'scroll-left': () => scrollBy(SCROLL_AMOUNT, 0),
    'scroll-right': () => scrollBy(-SCROLL_AMOUNT, 0),
    'scroll-to-top': () => scrollTo(0),
    'scroll-to-bottom': () => scrollTo(container.scrollHeight),
    'trigger-search': () => PDFViewerApplication.findBar.open(),
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
    const action = getActionFromKey(keys, commands, config.commands);
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

const getConfig = async () => {
  try {
    const response = await fetch('/config.json');
    if (!response.ok) {
      throw new Error('No config.json available. Using default.json');
    }
    return response.json();
  } catch {
    return fetch('/default.json').then(data => data.json());
  }
};

window.onload = async () => {
  const config = await getConfig();
  console.log('Config', config);
  const { toggleHelp } = createCustomElements(config);
  handleShortcuts(config, { toggleHelp });
  console.log(PDFViewerApplication);
};
