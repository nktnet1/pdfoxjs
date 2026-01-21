import {
  PDFViewerApplication,
  PDFViewerApplicationOptions,
} from './components/application.mjs';

PDFViewerApplicationOptions.set('enableSignatureEditor', true);
PDFViewerApplicationOptions.set('enableComment', true);
PDFViewerApplicationOptions.set('enableUpdatedAddImage', true);
PDFViewerApplicationOptions.set('enableHighlightFloatingButton', true);

import { createAllCustomElements } from './components/allCustomElements.mjs';
import { getConfig } from './utils/getConfig.mjs';
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

  const toggleToolbar = () =>
    isToolbarVisible() ? hideToolbar() : showToolbar();

  const toggleSidebar = () => {
    if (isToolbarVisible()) {
      PDFViewerApplication.pdfSidebar.toggle();
    } else {
      // Open toolbar before sidebar
      showToolbar();
      PDFViewerApplication.pdfSidebar.open();
    }
  };

  const config = await getConfig();
  if (config.settings.hideToolbar) {
    hideToolbar();
  }

  const closeAnnotationEditor = () => {
    const NONE_MODE = globalThis.pdfjsLib.AnnotationEditorType.NONE;
    if (PDFViewerApplication.pdfViewer.annotationEditorMode > NONE_MODE) {
      PDFViewerApplication.eventBus.dispatch('switchannotationeditormode', {
        mode: globalThis.pdfjsLib.AnnotationEditorType.NONE,
      });
    }
  };

  const { toggleHelp } = createAllCustomElements({ closeAnnotationEditor });
  if (config.settings.enableCustomShortcutKeys) {
    handleShortcuts(config, {
      toggleHelp,
      toggleToolbar,
      toggleSidebar,
      closeAnnotationEditor,
    });
  }
};
