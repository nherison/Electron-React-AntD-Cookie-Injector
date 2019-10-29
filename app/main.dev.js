/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, session, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
// import MenuBuilder from './menu';
import { runCookieInjector } from './utils';

import { TargetModel, SettingModel } from './reducers/types';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.commandLine.appendSwitch('disable-web-security');
app.on('ready', async () => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'none'"]
      }
    });
  });
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    minWidth: 1280,
    minHeight: 720,
    width: 1280,
    height: 720
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);
  mainWindow.setMenu(null);
  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
});

/**
 * Add iPC events
 */
// eslint-disable-next-line no-unused-vars
ipcMain.on(
  'runCommand',
  async (
    event,
    settings: SettingModel,
    targetData: TargetModel,
    service: string,
    cost: number
  ) => {
    const confirm = await dialog.showMessageBox(
      BrowserWindow.getFocusedWindow(),
      {
        type: 'question',
        buttons: ['Confirm', 'Cancel'],
        message: 'Are you sure?',
        cancelId: 1,
        defaultId: 0,
        detail: `You will be charged ${cost}.`
      }
    );
    if (confirm) return;
    try {
      await runCookieInjector(settings, targetData, service);
    } catch (e) {
      console.log(e.type);
      let detail =
        'Error from Injector. Please check your chrome driver is in the right place.';
      if (e.type === 'ChargeError')
        detail =
          'Target data is encrypted but no charge utility configured for decryption.';
      dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
        type: 'question',
        buttons: ['Confirm', 'Cancel'],
        message: 'Are you sure?',
        cancelId: 1,
        defaultId: 0,
        detail
      });
    }
  }
);
