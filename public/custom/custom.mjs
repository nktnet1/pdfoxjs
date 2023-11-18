import { PDFViewerApplication } from '../pdfjs-4.0.189-dist/web/viewer.mjs';
import { createHelpButton } from './helpButton.mjs';
import { createUploadButton } from './uploadButton.mjs';
import { createAndAppendElement } from './utils.mjs';

const SCROLL_AMOUNT = 200;

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

  const scroll = (event, x, y) => {
    event.stopPropagation();
    event.preventDefault();

    if (scrollRequestId === null) {
      const start = performance.now();

      const step = (timestamp) => {
        const elapsed = timestamp - start;
        container.scrollBy({
          behavior: 'smooth',
          left: x,
          top: y,
        });

        if (elapsed < 2000) {
          scrollRequestId = window.requestAnimationFrame(step);
        } else {
          scrollRequestId = null;
        }
      };

      scrollRequestId = window.requestAnimationFrame(step);
    }
  };

  let prevKeyTracker = null;
  container.addEventListener('keydown', (event) => {
    console.log(event.key, Math.random());
    switch (event.key) {
      case 'j':
        scroll(event, 0, SCROLL_AMOUNT);
        break;
      case 'k':
        scroll(event, 0, -SCROLL_AMOUNT);
        break;
      case 'l':
        scroll(event, SCROLL_AMOUNT, 0);
        break;
      case 'h':
        scroll(event, -SCROLL_AMOUNT, 0);
        break;
      case 'g':
        if (prevKeyTracker === 'g' && !event.repeat) {
          container.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }
        break;
      case 'G':
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
        break;
      default:
        break;
    }
    prevKeyTracker = event.key;

    container.addEventListener('keyup', () => {
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
  });
};
