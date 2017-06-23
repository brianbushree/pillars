const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow


const path = require('path')
const url = require('url')

const exec = require('child_process').exec
const fs = require('fs')

const projectMaker = require('./ProjectMaker.js')

let mainWindow

function createWindow() {

  mainWindow = new BrowserWindow({
      width: 800, height: 600,
      frame: false, titleBarStyle: 'hidden-inset' })

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  projectMaker.loadProject()
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})