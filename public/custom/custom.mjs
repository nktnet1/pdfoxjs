import { PDFViewerApplication } from '../pdfjs-4.0.189-dist/web/viewer.mjs';
import { createHelpButton } from './helpButton.mjs';
import { createUploadButton } from './uploadButton.mjs';
import { createAndAppendElement } from './utils.mjs';

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
    if (['h', '?', 'Escape'].includes(event.key)) {
      if (isOpen()) {
        closePopup();
      } else if (event.key !== 'Escape') {
        openPopup();
      }
    }
  });

  // Remove floating button if PDF renders
  PDFViewerApplication.eventBus?.on('pagesloaded', () => {
    const floatingUploadDiv = document.getElementById('floating-upload-a-document');
    if (floatingUploadDiv !== null) {
      floatingUploadDiv.style.display = 'none';
    }
  });
};
