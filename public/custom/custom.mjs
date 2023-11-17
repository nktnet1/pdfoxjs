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

  const container = PDFViewerApplication.pdfViewer.container;

  let scrollInterval = null;
  const scroll = (event, x, y) => {
    event.stopPropagation();
    event.preventDefault();
    if (scrollInterval === null) {
      scrollInterval = setInterval(() => {
        container.scrollBy({
          behavior: 'smooth',
          left: x,
          top: y,
        });
      }, 10);
    }
  };

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

  let prevKeyTracker = null;
  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case '?':
        isOpen() ? closePopup() : openPopup();
        break;
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
      case 'Escape':
        closePopup();
        break;
      default:
        break;
    }
    prevKeyTracker = event.key;

    document.addEventListener('keyup', () => {
      switch (event.key) {
        case 'j':
        case 'k':
        case 'h':
        case 'l':
        case 'G':
          clearInterval(scrollInterval);
          scrollInterval = null;
          break;
        default:
          break;
      }
    });
  });
};
