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
const inter = require('./interface.js')
const querystring = require('querystring');

let mainWindow;

/**
 * Init
 */
app.on('ready', createWindow);
app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Close/quit
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
      frame: true,
      nodeIntegrationInWorker: true });

  loadWindow('web/index.html');

  // DevTools
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  });
}

/**
 * Redirect main window.
 * 
 * @param {string} file  path to file
 */
function loadWindow(file) {
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, file),
    protocol: 'file:',
    slashes: true
  }));
}
exports.loadWindow = loadWindow;

/**
 * Redirect main window with query params.
 * 
 * @param {string} file    path to file
 * @param {object} params  query params
 */
function loadWindowWithParams(file, params) {
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, file),
    protocol: 'file:',
    slashes: true,
    search: querystring.stringify(params)
  }));
}
exports.loadWindowWithParams = loadWindowWithParams;

/**
 * Redirect main window & resize.
 * 
 * @param {string} file  path to file
 * @param {number} w  new width
 * @param {number} h  new height
 */
function loadWindowResize(file, w, h) {
  loadWindow(file);
  mainWindow.setBounds({
    x: 350,
    y: 200,
    width: w,
    height: h
  });
}

exports.loadWindowResize = loadWindowResize;
