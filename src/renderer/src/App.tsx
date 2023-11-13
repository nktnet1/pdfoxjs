import React from 'react';
import PdfjsViewerElement from 'pdfjs-viewer-element';
import 'pdfjs-viewer-element';
import './App.css';

function App(): JSX.Element {
  const [loaded, setLoaded] = React.useState(false);

  const handleClick = () =>
    // Click the openFile button from pdf.js toolbar
    document
      .getElementById('pdf-viewer-element')
      ?.shadowRoot
      ?.querySelector('iframe')
      ?.contentWindow
      ?.document
      .getElementById('openFile')
      ?.click();

  const getViewer = async () => {
    const viewer = document.querySelector('pdfjs-viewer-element') as PdfjsViewerElement;
    const viewerApp = await viewer.initialize();
    viewerApp.eventBus.on('pagesloaded', () => {
      setLoaded(true);
    });
  };

  React.useEffect(() => {
    getViewer();
  }, []);

  return (
    <div>
      {
        !loaded &&
          <div className='centered-element'>
            <div className='box'>
              <button onClick={handleClick} className='upload-button'>
                Upload a Document
              </button>
            </div>
          </div>
      }
      <pdfjs-viewer-element
        src=''
        id='pdf-viewer-element'
        style={{ height: '100vh' }}
        viewer-path='/assets/pdfjs-4.0.189-dist'
      />
    </div>
  );
}

export default App;
