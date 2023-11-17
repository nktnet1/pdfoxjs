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
  const scrollY = (scrollAmount) => {
    if (scrollInterval === null) {
      scrollInterval = setInterval(() => {
        container.scrollBy({
          behavior: 'smooth',
          top: scrollAmount,
        });
      });
    }
  };

  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'h':
      case '?':
        isOpen() ? closePopup() : openPopup();
        break;
      case 'k':
        event.stopPropagation();
        event.preventDefault();
        scrollY(-SCROLL_AMOUNT);
        break;
      case 'j':
        event.stopPropagation();
        event.preventDefault();
        scrollY(SCROLL_AMOUNT);
        break;
      case 'Escape':
        closePopup();
        break;
      default:
        break;
    }

    document.addEventListener('keyup', () => {
      switch (event.key) {
        case 'j':
        case 'k':
          clearInterval(scrollInterval);
          scrollInterval = null;
          break;
        default:
          break;
      }
    });
  });

  // Remove floating button if PDF renders
  PDFViewerApplication.eventBus?.on('pagesloaded', () => {
    const floatingUploadDiv = document.getElementById('floating-upload-a-document');
    if (floatingUploadDiv !== null) {
      floatingUploadDiv.style.display = 'none';
    }
  });
};
