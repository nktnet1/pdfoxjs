import path from 'path';
import { app, BrowserWindow } from 'electron';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { createBrowserWindow, createPdfPath, exitHelp, startServer } from './e-utils';

interface WindowSettings {
  isMainInstance: boolean;
  pdfPath: string;
}

let appUrl: string | null = null;
const setAppUrl = (newUrl: string) => (appUrl = newUrl);

const fileArgumentIndex = is.dev ? 2 : 1;
const fileArgument = process.argv[fileArgumentIndex];

if (process.argv.length > fileArgumentIndex + 1) {
  exitHelp();
}

if (!app.requestSingleInstanceLock({ pdfPath: fileArgument })) {
  app.quit();
  process.exit(0);
}

const createWindow = ({ isMainInstance, pdfPath }: WindowSettings): BrowserWindow => {
  const browserWindow = createBrowserWindow();
  if (isMainInstance) {
    if (is.dev) {
      startServer(3000, 'public', (serverUrl) => {
        browserWindow.loadURL(path.join(serverUrl, pdfPath));
        browserWindow.webContents.openDevTools();
        setAppUrl(serverUrl);
        console.log(`Development: ${appUrl}`);
      });
    } else {
      startServer(0, path.join(process.resourcesPath, 'public'), (serverUrl) => {
        browserWindow.loadURL(path.join(serverUrl, pdfPath));
        setAppUrl(serverUrl);
        console.log(`Production: ${appUrl}`);
      });
    }
  } else {
    if (appUrl === null) {
      throw new Error('Error: please close all instances of the application and try again.');
    }
    browserWindow.loadURL(path.join(appUrl, pdfPath));
  }
  return browserWindow;
};

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow({ isMainInstance: true, pdfPath: createPdfPath(fileArgument) });

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow({ isMainInstance: true, pdfPath: createPdfPath(fileArgument) });
    }
  });

  app.on('second-instance', (_event, _commandLine, _workingDirectory, additionalData) => {
    const filepath: string = (additionalData as any).pdfPath;
    createWindow({ isMainInstance: false, pdfPath: createPdfPath(filepath) });
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
