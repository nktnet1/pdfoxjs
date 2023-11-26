import fs from 'fs';
import path from 'path';
import { AddressInfo } from 'net';
import contextMenu from 'electron-context-menu';
import { BrowserWindow, shell } from 'electron';
import { APP_NAME, PDF_FETCH_PATH, viewerPath } from './config';
import createExpressApp, { Options } from './app';

export const exitHelp = (exitStatus: number = 1) => {
  console.log(`
Usage:
    ${APP_NAME} [PATH_TO_PDF]
Example:
    ${APP_NAME}
    ${APP_NAME} current.pdf
    ${APP_NAME} ../../relative.pdf
    ${APP_NAME} /path/to/your/absolute.pdf
`);
  process.exit(exitStatus);
};

const checkPDF = (filepath: string) => {
  const buffer = fs.readFileSync(filepath);
  if (!Buffer.isBuffer(buffer)) {
    throw new Error(`Failed to read '${filepath}' - invalid buffer`);
  }
  if (buffer.lastIndexOf('%PDF-') !== 0) {
    throw new Error(`File '${filepath}' does not have the bytes '%PDF-' as the first and only occurence`);
  }
  if (buffer.lastIndexOf('%%EOF') === -1) {
    throw new Error(`File '${filepath}' does contain the bytes '%%EOF'`);
  }
};

export const createPdfPath = (filepath: string) => {
  if (filepath) {
    try {
      checkPDF(filepath);
    } catch (error: any) {
      console.error(`[${APP_NAME}]: ${error.message}.`);
      process.exit(1);
    }
    const absoluteFilePath = path.resolve(filepath);
    filepath = encodeURIComponent(`${PDF_FETCH_PATH}?filepath=${absoluteFilePath}`);
  }
  return `/${viewerPath}?file=${filepath}`;
};

export const startServer = (port: number, options: Options, callback: (url: string) => void) => {
  const expressApp = createExpressApp(options);
  const server = expressApp.listen(port, () => {
    const addresses = server.address() as AddressInfo;
    callback(`http://127.0.0.1:${addresses.port}`);
  });
};

export const createBrowserWindow = () => {
  contextMenu({ showSaveImageAs: true });

  const browserWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: { sandbox: false, webSecurity: true },
  });

  // Always open links externally in the user's browser
  browserWindow.webContents.on('will-navigate', (event, linkUrl) => {
    if (!linkUrl.startsWith(browserWindow.webContents.getURL())) {
      event.preventDefault();
      shell.openExternal(linkUrl);
    }
  });

  browserWindow.on('ready-to-show', () => {
    browserWindow.show();
  });

  browserWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  return browserWindow;
};
