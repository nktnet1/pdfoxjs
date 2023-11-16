import { PDFViewerApplication } from '../pdfjs-4.0.189-dist/web/viewer.mjs';
import { createAndAppendElement } from './utils.mjs';

export const createUploadButton = (parent) => {
  return createAndAppendElement(
    parent,
    'button',
    {
      className: 'upload-button',
      textContent: 'Upload a Document',
      onclick: () => {
        const fileInput = PDFViewerApplication.appConfig.openFileInput;
        fileInput.click();
      }
    }
  );
};
