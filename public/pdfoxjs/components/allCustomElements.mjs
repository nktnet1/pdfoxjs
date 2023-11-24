import { PDFViewerApplication } from './application.mjs';
import { createFloatingDiv } from './floatingDiv.mjs';
import { createHelpButton } from './helpButton.mjs';
import { createUploadButton } from './uploadButton.mjs';
import { createChildElement } from '../utils/creation.mjs';

export const createAllCustomElements = ({ closeAnnotationEditor }) => {
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
  const hideFloatingDiv = () => (floatingDiv.style.display = 'none');
  if (PDFViewerApplication.eventBus) {
    PDFViewerApplication.eventBus.on('pagesloaded', hideFloatingDiv);
  } else {
    setTimeout(() => {
    // In case the button loads before the PDF not hidden
      PDFViewerApplication.url !== '' && hideFloatingDiv();
    }, 1000);
  }

  createUploadButton(floatingDiv);
  const { isOpen, openPopup, closePopup } = createHelpButton(floatingDiv);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      isOpen() && closePopup();
      closeAnnotationEditor();
      PDFViewerApplication.pdfViewer.focus();
    }
  });

  const toggleHelp = () => isOpen() ? closePopup() : openPopup();
  return { toggleHelp };
};
