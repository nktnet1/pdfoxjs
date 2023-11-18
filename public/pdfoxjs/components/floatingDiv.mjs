import { createChildElement } from '../utils/creation.mjs';

export const createFloatingDiv = () => {
  return createChildElement(
    document.body,
    'div',
    {
      id: 'floating-upload-a-document',
      className: 'centered-element',
    }
  );
};
