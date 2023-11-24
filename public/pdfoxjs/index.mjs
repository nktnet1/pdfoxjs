import { createAllCustomElements } from './components/allCustomElements.mjs';
import { PDFViewerApplication } from './components/application.mjs';
import { handleShortcuts } from './utils/handleShortcuts.mjs';

window.onload = async () => {
  const toolbar = document.getElementById('toolbarContainer');
  const viewerContainer = document.getElementById('viewerContainer');

  const hideToolbar = () => {
    toolbar.classList.add('hidden');
    viewerContainer.classList.add('noInset');
    PDFViewerApplication.pdfSidebar.close();
  };

  const showToolbar = () => {
    toolbar.classList.remove('hidden');
    viewerContainer.classList.remove('noInset');
  };

  const isToolbarVisible = () => !toolbar.classList.contains('hidden');

  const toggleToolbar = () => isToolbarVisible() ? hideToolbar() : showToolbar();

  const toggleSidebar = () => {
    if (isToolbarVisible()) {
      PDFViewerApplication.pdfSidebar.toggle();
    } else {
      // Open toolbar before sidebar
      showToolbar();
      PDFViewerApplication.pdfSidebar.open();
    }
  };

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

  const config = await getConfig();
  if (config.settings.hideToolbar) {
    hideToolbar();
  }

  const closeAnnotationEditor = () => {
    PDFViewerApplication.eventBus.dispatch(
      'switchannotationeditormode',
      { mode: globalThis.pdfjsLib.AnnotationEditorType.NONE }
    );
  };

  const { toggleHelp } = createAllCustomElements({ closeAnnotationEditor });
  if (config.settings.enableCustomShortcutKeys) {
    handleShortcuts(config, { toggleHelp, toggleToolbar, toggleSidebar, closeAnnotationEditor });
  }
};
