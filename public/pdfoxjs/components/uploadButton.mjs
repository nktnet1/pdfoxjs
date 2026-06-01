import { createChildElement } from "../utils/creation.mjs";
import { PDFViewerApplication } from "./application.mjs";

export const createUploadButton = (parent) => {
  return createChildElement(parent, "button", {
    className: "upload-button",
    textContent: "Upload a Document",
    onclick: () => {
      PDFViewerApplication.eventBus.dispatch("openfile");
      PDFViewerApplication.pdfViewer.container.focus();
    },
  });
};
