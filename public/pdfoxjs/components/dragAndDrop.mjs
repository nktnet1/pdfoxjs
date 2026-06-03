import { PDFViewerApplication } from "./application.mjs";
import { addNotification } from "./snackbar.mjs";

export const initializeDragAndDrop = (targetElement) => {
  const overlay = document.createElement("div");
  overlay.className = "pdfoxjs-drag-overlay";
  overlay.innerHTML = `
    <div class="pdfoxjs-drag-message">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="12" y1="18" x2="12" y2="12"></line>
        <polyline points="9 15 12 12 15 15"></polyline>
      </svg>
      <span>Drop your PDF here</span>
    </div>
  `;

  document.body.appendChild(overlay);

  const floatingDiv = document.getElementById("floating-upload-a-document");

  const preventDefaults = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    targetElement.addEventListener(eventName, preventDefaults, false);
    if (floatingDiv) {
      floatingDiv.addEventListener(eventName, preventDefaults, false);
    }
  });

  let dragCounter = 0;

  const isInsideAppZone = (relatedTarget) => {
    if (!relatedTarget) return false;
    return (
      targetElement.contains(relatedTarget) ||
      floatingDiv?.contains(relatedTarget)
    );
  };

  targetElement.addEventListener(
    "dragenter",
    (event) => {
      if (!isInsideAppZone(event.relatedTarget)) {
        dragCounter++;
        if (dragCounter === 1) overlay.classList.add("active");
      }
    },
    false,
  );

  targetElement.addEventListener(
    "dragleave",
    (event) => {
      if (!isInsideAppZone(event.relatedTarget)) {
        dragCounter--;
        if (dragCounter === 0) overlay.classList.remove("active");
      }
    },
    false,
  );

  if (floatingDiv) {
    floatingDiv.addEventListener(
      "dragenter",
      (event) => {
        if (!isInsideAppZone(event.relatedTarget)) {
          dragCounter++;
          if (dragCounter === 1) overlay.classList.add("active");
        }
      },
      false,
    );

    floatingDiv.addEventListener(
      "dragleave",
      (event) => {
        if (!isInsideAppZone(event.relatedTarget)) {
          dragCounter--;
          if (dragCounter === 0) overlay.classList.remove("active");
        }
      },
      false,
    );

    floatingDiv.addEventListener(
      "drop",
      async (event) => {
        dragCounter = 0;
        overlay.classList.remove("active");
        handleFileDrop(event);
      },
      false,
    );
  }

  const handleFileDrop = async (event) => {
    const dt = event.dataTransfer;
    const files = dt.files;

    if (files && files.length > 0) {
      const file = files[0];

      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        try {
          await PDFViewerApplication.close();
        } catch (e) {
          console.warn(e);
        }

        PDFViewerApplication.open({
          url: URL.createObjectURL(file),
          originalUrl: file.name,
        }).then(() => {
          PDFViewerApplication.pdfViewer.container.focus();
        });
      } else {
        addNotification("Please drop a valid PDF file.");
      }
    }
  };

  targetElement.addEventListener(
    "drop",
    async (event) => {
      dragCounter = 0;
      overlay.classList.remove("active");
      handleFileDrop(event);
    },
    false,
  );
};
