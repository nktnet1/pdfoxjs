import fs from 'fs';
import path from 'path';
import { app, BrowserWindow, dialog, MessageBoxOptions } from 'electron';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { createBrowserWindow, createPdfPath, exitHelp, startServer } from './e-utils';
import { APP_NAME, DEFAULT_CONFIG_FILE_NAME, USER_CONFIG_DIRECTORY_NAME, USER_CONFIG_FILE_NAME } from './config';
import { autoUpdater } from 'electron-updater';

interface WindowSettings {
  pdfPaths: string[];
}

let appUrl: string | null = null;
const setAppUrl = (newUrl: string) => (appUrl = newUrl);

const fileArgumentIndex = is.dev ? 2 : 1;

if (['-h', '--help'].includes(process.argv[fileArgumentIndex])) {
  exitHelp(0);
}

const pdfPathInputs = process.argv.slice(fileArgumentIndex).map(createPdfPath);

// If no arguments are specified, use '' to still launch the second window instance.
if (!app.requestSingleInstanceLock({ pdfPaths: pdfPathInputs.length ? pdfPathInputs : [''] })) {
  app.quit();
  process.exit(0);
}

const createSecondaryWindows = ({ pdfPaths }: WindowSettings): void => {
  if (appUrl === null) {
    throw new Error('Error: please close all instances of the application and try again.');
  }
  pdfPaths.forEach((pdfPath) => {
    const browserWindow = createBrowserWindow();
    browserWindow.loadURL(path.join(appUrl, pdfPath));
  });
};

const createMainWindow = ({ pdfPaths }: WindowSettings): BrowserWindow => {
  const browserWindow = createBrowserWindow();

  const userDataPath = app.getPath('userData');

  const createConfig = (resourcesPath: string, userDataPath: string): string => {
    const dirPath = path.join(userDataPath, USER_CONFIG_DIRECTORY_NAME);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const configFilePath = path.join(dirPath, USER_CONFIG_FILE_NAME);
    const defaultConfigPath = path.join(resourcesPath, DEFAULT_CONFIG_FILE_NAME);
    if (!fs.existsSync(configFilePath)) {
      fs.copyFileSync(defaultConfigPath, configFilePath);
    }
    return configFilePath;
  };

  const loadPDF = (serverUrl: string, pdfPath: string) => {
    browserWindow.loadURL(path.join(serverUrl, pdfPath));
    setAppUrl(serverUrl);
    createSecondaryWindows({ pdfPaths: pdfPaths.slice(1) });
  };

  if (is.dev) {
    const resourcesPath = 'public';
    createConfig(resourcesPath, userDataPath);
    startServer(
      3000,
      { resourcesPath, userDataPath },
      (serverUrl: string) => {
        loadPDF(serverUrl, pdfPaths[0] ?? '');
        browserWindow.webContents.openDevTools();
        console.log(`Development: ${appUrl}`);
      }
    );
  } else {
    const resourcesPath = path.join(process.resourcesPath, 'public');
    startServer(
      0,
      { resourcesPath, userDataPath },
      (serverUrl: string) => {
        loadPDF(serverUrl, pdfPaths[0] ?? '');
      }
    );
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

  const mainWindow = createMainWindow({ pdfPaths: pdfPathInputs });

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow({ pdfPaths: pdfPathInputs });
    }
  });

  app.on('second-instance', (_event, _commandLine, _workingDirectory, additionalData) => {
    const pdfPaths = (additionalData as WindowSettings).pdfPaths;
    createSecondaryWindows({ pdfPaths });
  });

  // ======================================================================= //
  // AUTO-UPDATES
  // ======================================================================= //

  mainWindow.once('ready-to-show', () => {
    autoUpdater.autoDownload = false;
    autoUpdater.checkForUpdates();
  });

  autoUpdater.on('update-available', (event) => {
    const dialogOpts: MessageBoxOptions = {
      type: 'info',
      buttons: ['No', 'Yes'],
      title: `${APP_NAME} has a new update Available`,
      message: process.platform === 'win32' ? event.releaseNotes as string : event.releaseName,
      detail: `A new version (${event.version}) is available. Would you like to download it?`
    };
    dialog.showMessageBox(mainWindow, dialogOpts).then((returnValue) => {
      if (returnValue.response === 1) {
        autoUpdater.downloadUpdate();
      }
    });
  });

  autoUpdater.on('update-downloaded', (event) => {
    const dialogOpts: MessageBoxOptions = {
      type: 'info',
      buttons: ['Later', 'Restart'],
      title: `${APP_NAME} has been updated`,
      message: process.platform === 'win32' ? event.releaseNotes as string : event.releaseName,
      detail: `Version ${event.version} has been downloaded. Would you like to restart the application to apply the new updates?`
    };
    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 1) {
        autoUpdater.quitAndInstall();
      }
    });
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
