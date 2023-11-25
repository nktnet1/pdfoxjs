import { createChildElement } from '../utils/creation.mjs';

const containerId = 'snackbar-container';

export const createSnackbarContainer = () => {
  return createChildElement(
    document.body,
    'div',
    { id: containerId }
  );
};

export const addNotification = (text, duration = 3000) => {
  const container = document.getElementById(containerId);
  const snackbar = createChildElement(
    container,
    'div',
    {
      className: 'snackbar show',
      innerHTML: text,
    }
  );

  let timer = null;
  const removeSnackbar = () => {
    snackbar.className = snackbar.className.replace('snackbar show', 'snackbar');
    setTimeout(() => {
      container.removeChild(snackbar);
    }, 1000);
    clearTimeout(timer);
  };
  snackbar.addEventListener('click', removeSnackbar);
  // Note: changing this timeout to a different value requires modifying .snackbar.snow css
  timer = setTimeout(removeSnackbar, 5000);
  return snackbar;
};
