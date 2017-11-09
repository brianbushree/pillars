const electron = require('electron');
const {ipcMain} = electron;
const dialog = electron.dialog;
const projectMaker = require('./ProjectMaker.js');
const main = require('./main.js');

ipcMain.on('start', function (event, data) {
  main.loadWindow('index.html');
});

ipcMain.on('load_existing', function (event, data) {
  main.loadWindow('load-existing.html');
});

ipcMain.on('load_new', function (event, data) {
  main.loadWindow('load-new.html');
});

ipcMain.on('class_prompt', function (event, data) {
  event.sender.send('class_rec', get_dirs());
});

ipcMain.on('src_prompt', function (event, data) {
  event.sender.send('src_rec', get_dirs());
});

ipcMain.on('classpath_prompt', function (event, data) {
  event.sender.send('classpath_rec', get_paths());
});

ipcMain.on('load_project', function (event, data) {
  console.log(data);
  projectMaker.loadProject(data);
});

function get_dirs() {
    return dialog.showOpenDialog({
      properties: [ 'openDirectory', 'multiSelections' ] });
}

function get_paths() {
    return dialog.showOpenDialog({
    properties: [ 'openDirectory', 'openFile', 'multiSelections' ] });
}