import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'pdfjs-viewer-element': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { src?: string, 'viewer-path': string, locale?: string };
    }
  }
}
