/**
 *  main.js 
 *    
 *    handles Electron init/close/response events
 *    
 */
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const exec = require('child_process').exec;
const fs = require('fs');
const projectMaker = require('./ProjectMaker.js');
const {ipcMain} = require('electron');

let mainWindow;

/**
 *  Create initial Electron window.
 */
function createWindow() {

  mainWindow = new BrowserWindow({
      width: 800, height: 600,
      frame: false,
      titleBarStyle: 'hidden-inset' });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // DevTools
  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  });

  /* eventually trigger onClick() 
      and add to renderer.js     */ 
  // projectMaker.loadProject();
}

ipcMain.on('load-project', function () {
    projectMaker.loadProject();
});

/**
 * init
 */
app.on('ready', createWindow);
app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * close/quit
 */
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
