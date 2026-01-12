import { PDFViewerApplication } from './application.mjs';
import { createChildElement } from '../utils/creation.mjs';

export const createUploadButton = (parent) => {
  return createChildElement(
    parent,
    'button',
    {
      className: 'upload-button',
      textContent: 'Upload a Document',
      onclick: () => {
        PDFViewerApplication.eventBus.dispatch('openfile');
        PDFViewerApplication.pdfViewer.container.focus();
      }
    }
  );
};
