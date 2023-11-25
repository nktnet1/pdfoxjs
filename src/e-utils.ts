import path from 'path';
import { APP_NAME, viewerPath } from './config';
import { AddressInfo } from 'net';
import createExpressApp from './app';
import contextMenu from 'electron-context-menu';
import { BrowserWindow, shell } from 'electron';

export const exitHelp = () => {
  console.log(`
    Usage:
      ${APP_NAME} [PATH_TO_PDF]
    Example:
      ${APP_NAME}
      ${APP_NAME} current.pdf
      ${APP_NAME} ../../relative.pdf
      ${APP_NAME} /path/to/your/absolute.pdf
  `);
  process.exit(1);
};

export const createPdfPath = (filepath: string) => {
  if (filepath) {
    const absoluteFilePath = path.resolve(filepath);
    filepath = encodeURIComponent(path.join('/pdf?filepath=', absoluteFilePath));
  }
  return `/${viewerPath}?file=${filepath}`;
};

export const startServer = (port: number, resourcesPath: string, callback: (url: string) => void) => {
  const expressApp = createExpressApp({ resourcesPath });
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
