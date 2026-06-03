import { PDFViewerApplication } from "./application.mjs";
import { initializeDragAndDrop } from "./dragAndDrop.mjs";
import { createFloatingDiv } from "./floatingDiv.mjs";
import { createHelpButton } from "./helpButton.mjs";
import { addNotification, createSnackbarContainer } from "./snackbar.mjs";
import { createUploadButton } from "./uploadButton.mjs";

export const createAllCustomElements = ({ closeAnnotationEditor }) => {
  createSnackbarContainer();

  const floatingDiv = createFloatingDiv();
  const hideFloatingDiv = () => {
    floatingDiv.style.display = "none";
  };

  if (PDFViewerApplication.eventBus) {
    PDFViewerApplication.eventBus.on("pagesloaded", hideFloatingDiv);

    PDFViewerApplication.eventBus.on("documenterror", (evt) => {
      const message = `Error: ${evt.reason?.message ?? evt.reason ?? "Failed to load document."}`;
      addNotification(message);
      PDFViewerApplication.loading = false;
      PDFViewerApplication.close();
    });
  } else {
    setTimeout(() => {
      // In case the button loads before the PDF not hidden
      if (PDFViewerApplication.url !== "") {
        hideFloatingDiv();
      }
    }, 1000);
  }

  createUploadButton(floatingDiv);
  const { isOpen, openPopup, closePopup } = createHelpButton(floatingDiv);

  const viewerContainer = document.getElementById("viewerContainer");
  initializeDragAndDrop(viewerContainer);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (isOpen()) {
        closePopup();
      }
      closeAnnotationEditor();
      PDFViewerApplication.pdfViewer.focus();
    }
  });

  const toggleHelp = () => (isOpen() ? closePopup() : openPopup());
  return { toggleHelp };
};
