import { existsSync, symlinkSync, unlinkSync } from 'fs';
import path from 'path';
import { AddressInfo } from 'net';
import { app, shell, BrowserWindow } from 'electron';
import contextMenu from 'electron-context-menu';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import createExpressApp from './app';
import { viewerPath } from './config';

const APP_NAME = 'pdfoxjs';
let appUrl: string | null = null;

const fileArgumentIndex = is.dev ? 2 : 1;

if (process.argv.length > fileArgumentIndex + 1) {
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
}

if (!app.requestSingleInstanceLock({ message: 'Second instance', date: new Date() })) {
  app.quit();
  console.log('[NOTE]: Another instance of this App already exists. Closing...');
  process.exit(0);
}

function createWindow(isMainInstance = true): BrowserWindow {
  contextMenu({
    showSaveImageAs: true
  });

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      sandbox: false,
      webSecurity: true,
    },
  });

  // Always open links externally in the user's browser
  mainWindow.webContents.on('will-navigate', (event, linkUrl) => {
    if (!linkUrl.startsWith(mainWindow.webContents.getURL())) {
      event.preventDefault();
      shell.openExternal(linkUrl);
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (isMainInstance) {
    const startServer = (port: number, resourcesPath: string, callback: () => void) => {
      const expressApp = createExpressApp({ resourcesPath });
      const server = expressApp.listen(port, () => {
        const addresses = server.address() as AddressInfo;
        if (process.argv[fileArgumentIndex]) {
          const absoluteFilePath = path.resolve(process.argv[fileArgumentIndex]);
          const filename = path.basename(absoluteFilePath);
          const newPath = path.join(resourcesPath, path.dirname(viewerPath), filename);
          if (existsSync(newPath)) {
            unlinkSync(newPath);
          }
          symlinkSync(absoluteFilePath, newPath, 'file');
          appUrl = `http://localhost:${addresses.port}/${viewerPath}?file=${filename}`;
        } else {
          appUrl = `http://localhost:${addresses.port}/${viewerPath}`;
        }

        mainWindow.loadURL(appUrl);
        callback();
      });
    };

    if (is.dev) {
      startServer(3000, 'public', () => {
        mainWindow.webContents.openDevTools();
        console.log(`Dev server: ${appUrl}`);
      });
    } else {
      startServer(0, path.join(process.resourcesPath, 'public'), () => { console.log(appUrl); });
    }
  } else {
    if (appUrl === null) {
      throw new Error('Error: please close all instances of the application and try again.');
    }
    mainWindow.loadURL(appUrl);
  }
  return mainWindow;
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on('second-instance', (_event, _commandLine, _workingDirectory, additionalData) => {
    // Print out data received from the second instance.
    console.log(additionalData);
    createWindow(false);
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    process.exit();
  }
});
