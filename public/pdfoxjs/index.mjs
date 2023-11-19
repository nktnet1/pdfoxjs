import { createAllCustomElements } from './components/allCustomElements.mjs';
import { PDFViewerApplication } from './components/application.mjs';
import { handleShortcuts } from './utils/handleShortcuts.mjs';

const getConfig = async () => {
  try {
    const response = await fetch('/config.json');
    if (!response.ok) {
      throw new Error('No config.json available. Using default.json');
    }
    return response.json();
  } catch {
    return fetch('/default.json').then(data => data.json());
  }
};

window.onload = async () => {
  const config = await getConfig();
  const { toggleHelp } = createAllCustomElements(config);
  handleShortcuts(config, { toggleHelp });
  console.log(PDFViewerApplication);
};
