export const createElement = (tag, attributes) => Object.assign(document.createElement(tag), attributes);

export const createChildElement = (parent, tag, attributes) => {
  const element = createElement(tag, attributes);
  parent.appendChild(element);
  return element;
};
