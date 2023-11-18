import { PDFViewerApplication } from '../pdfjs-4.0.189-dist/web/viewer.mjs';
import { createHelpButton } from './helpButton.mjs';
import { createUploadButton } from './uploadButton.mjs';
import { createAndAppendElement } from './utils.mjs';

const SCROLL_AMOUNT = 50;

const createFloatingDiv = () => {
  return createAndAppendElement(
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
  createAndAppendElement(
    document.head,
    'link',
    {
      rel: 'stylesheet',
      type: 'text/css',
      href: '../../custom/custom.css',
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
        scrollRequestId = elapsed < 2000 ? window.requestAnimationFrame(step) : null;
      };
      scrollRequestId = window.requestAnimationFrame(step);
    }
  };

  const scrollTo = (top) => {
    container.scrollTo({
      behavior: 'smooth',
      top,
    });
  };

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
