import { createChildElement } from "../utils/creation.mjs";

const containerId = "snackbar-container";

export const createSnackbarContainer = () => {
  return createChildElement(document.body, "div", { id: containerId });
};

export const addNotification = (text) => {
  const container = document.getElementById(containerId);
  const snackbar = createChildElement(container, "div", {
    className: "snackbar show",
    innerHTML: text,
  });

  let autoHideTimer = null;
  let domRemovalTimer = null;

  const removeSnackbar = () => {
    snackbar.removeEventListener("click", removeSnackbar);
    clearTimeout(autoHideTimer);
    clearTimeout(domRemovalTimer);

    snackbar.className = "snackbar";

    domRemovalTimer = setTimeout(() => {
      if (snackbar.parentNode === container) {
        container.removeChild(snackbar);
      }
    }, 500);
  };

  snackbar.addEventListener("click", removeSnackbar);
  // Note: changing this timeout to a different value requires modifying .snackbar.snow css
  autoHideTimer = setTimeout(removeSnackbar, 5000);

  return snackbar;
};
