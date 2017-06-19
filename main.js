const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const dialog = electron.dialog

const path = require('path')
const url = require('url')

const exec = require('child_process').exec
const fs = require('fs')

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

  loadProject()
}

function loadProject() {
  openDirectory()
}

function openDirectory() {

  let dir = dialog.showOpenDialog({
      properties: [ 'openDirectory' ] })

  if (dir.length > 0) {
    dir.forEach(function(d) {
      fs.readdir(d, (err, files) => {
        files.forEach(file => {
          if (file.split('.').pop() == 'class') {
            let f = (d + '/' + file).replace(/ /g, '\\ ')
            exec('javap -p ' + f,
              function (error, stdout, stderr){
                console.log('Output -> ' + stdout);
                if(error !== null){
                  console.log("Error -> "+error);
                }
            })
          }
        })
      })
    })
  }
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
