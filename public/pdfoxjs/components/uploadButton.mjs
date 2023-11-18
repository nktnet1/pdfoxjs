import { PDFViewerApplication } from '../config/application.mjs';
import { createChildElement } from '../utils/creation.mjs';

export const createUploadButton = (parent) => {
  return createChildElement(
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
