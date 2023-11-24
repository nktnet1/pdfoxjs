import path from 'path';
import { AddressInfo } from 'net';
import { app, shell, BrowserWindow } from 'electron';
import contextMenu from 'electron-context-menu';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import createExpressApp from './app.js';

function createWindow(): void {
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
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(mainWindow.webContents.getURL())) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  const startServer = (port: number, resourcesPath: string, callback: (url: string) => void) => {
    const expressApp = createExpressApp({ resourcesPath });
    const server = expressApp.listen(port, () => {
      const addresses = server.address() as AddressInfo;
      const url = `http://localhost:${addresses.port}`;
      mainWindow.loadURL(url);
      callback(url);
    });
  };

  if (is.dev) {
    startServer(3000, 'public', (url) => {
      mainWindow.webContents.openDevTools();
      console.log(`Dev server: ${url}`);
    });
  } else {
    startServer(0, path.join(process.resourcesPath, 'public'), (url) => { console.log(url); });
  }
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
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
