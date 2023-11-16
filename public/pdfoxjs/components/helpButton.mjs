import { createChildElement } from '../utils/creation.mjs';

export const createHelpButton = (parent) => {
  const closeOnOutsideClick = (event, ignoreTarget) => {
    if (!popupContainer.contains(event.target) && event.target !== helpButton) {
      closePopup();
    }
  };

  const openPopup = () => {
    popupContainer.style.display = 'block';
    document.addEventListener('click', (event) => closeOnOutsideClick(event, helpButton));
  };

  const helpButton = createChildElement(
    parent,
    'button',
    {
      id: 'help-button',
      innerText: 'Help',
      onclick: openPopup,
    }
  );

  const popupContainer = createChildElement(
    document.body,
    'div', {
      id: 'popup-container'
    }
  );

  // Help Image
  createChildElement(
    popupContainer,
    'img',
    {
      id: 'help-image',
      src: '../../help.png',
      alt: 'Help Image'
    }
  );

  const closePopup = () => {
    popupContainer.style.display = 'none';
    document.removeEventListener('click', closeOnOutsideClick);
  };

  // Close Button
  createChildElement(
    popupContainer,
    'button',
    {
      className: 'close-button',
      innerText: 'Close',
      onclick: closePopup,
    }
  );

  const isOpen = () => popupContainer.style.display === 'block';

  return { isOpen, openPopup, closePopup };
};
