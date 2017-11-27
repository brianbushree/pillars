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
const interf = require('./interface.js');

let mainWindow;

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

/**
 *  Create initial Electron window.
 */
function createWindow() {

  mainWindow = new BrowserWindow({
      width: 800, height: 600,
      center: true,
      frame: false,
      titleBarStyle: 'hidden-inset',
      nodeIntegrationInWorker: true });

  loadWindow('web/index.html');

  // DevTools
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  });

  /* eventually trigger onClick() 
      and add to renderer.js     */ 
  // projectMaker.loadProject();
}

function loadWindow(file) {
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, file),
    protocol: 'file:',
    slashes: true
  }));
}
module.exports.loadWindow = loadWindow;


function loadWindowResize(file, w, h) {
  loadWindow(file);
  mainWindow.setBounds({
    x: 350,
    y: 200,
    width: w,
    height: h
  });
}
module.exports.loadWindowResize = loadWindowResize;
