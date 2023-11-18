import { PDFViewerApplication } from './components/application.mjs';
import { createHelpButton } from './components/helpButton.mjs';
import { createUploadButton } from './components/uploadButton.mjs';
import { createChildElement } from './utils/creation.mjs';

const SCROLL_AMOUNT = 30;

const createFloatingDiv = () => {
  return createChildElement(
    document.body,
    'div',
    {
      id: 'floating-upload-a-document',
      className: 'centered-element',
    }
  );
};

window.onload = () => {
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
  createUploadButton(floatingDiv);

  const { isOpen, openPopup, closePopup } = createHelpButton(floatingDiv);

  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case '?':
        isOpen() ? closePopup() : openPopup();
        break;
      case 'Escape':
        closePopup();
        break;
      default:
        break;
    }
  });

  // Remove floating button if PDF renders
  PDFViewerApplication.eventBus?.on('pagesloaded', () => {
    const floatingUploadDiv = document.getElementById('floating-upload-a-document');
    if (floatingUploadDiv !== null) {
      floatingUploadDiv.style.display = 'none';
    }
  });

  // ======================================================================= //
  // Shortcuts
  // ======================================================================= //

  const container = PDFViewerApplication.pdfViewer.container;

  let scrollRequestId = null;

  const scrollBy = (event, x, y) => {
    event.stopPropagation();
    event.preventDefault();
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

  let prevKeyTracker = null;
  container.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'j':
        scrollBy(event, 0, SCROLL_AMOUNT);
        break;
      case 'k':
        scrollBy(event, 0, -SCROLL_AMOUNT);
        break;
      case 'l':
        scrollBy(event, SCROLL_AMOUNT, 0);
        break;
      case 'h':
        scrollBy(event, -SCROLL_AMOUNT, 0);
        break;
      case 'g':
        prevKeyTracker === 'g' && !event.repeat && scrollTo(0);
        break;
      case 'G':
        scrollTo(container.scrollHeight);
        break;
      default:
        break;
    }
    prevKeyTracker = event.key;
  });

  container.addEventListener('keyup', (event) => {
    switch (event.key) {
      case 'j':
      case 'k':
      case 'h':
      case 'l':
      case 'G':
        if (scrollRequestId !== null) {
          window.cancelAnimationFrame(scrollRequestId);
          scrollRequestId = null;
        }
        break;
      default:
        break;
    }
  });
};
