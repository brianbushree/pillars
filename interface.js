const electron = require('electron');
const {ipcMain} = electron;
const {app} = electron;
const dialog = electron.dialog;
//const projectMaker = require('./ProjectMaker.js');
// const visBuilder = require('./vis-builder/Vis-Builder.js');
const hierarchyParser = require('./hierarchy-parser/Hierarchy-Parser.js');
const main = require('./main.js');
const { fork } = require('child_process');

let worker = fork('worker.js', [],
 { stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ] });

let project = null;
let visData = null;

ipcMain.on('start', function (event) {
  main.loadWindow('web/index.html');
});

ipcMain.on('load_existing', function (event) {
  main.loadWindow('web/load-existing.html');
});

ipcMain.on('load_new', function (event) {
  main.loadWindow('web/load-new.html');
});

ipcMain.on('class_prompt', function (event) {
  event.sender.send('class_rec', get_dirs());
});

ipcMain.on('src_prompt', function (event) {
  event.sender.send('src_rec', get_dirs());
});

ipcMain.on('classpath_prompt', function (event) {
  event.sender.send('classpath_rec', get_paths());
});

ipcMain.on('load_project', function (event, data) {
  console.log(data);

  // fork??
  // projectMaker.loadProject(data, function(err, data) {
  //   if (err) {
  //     console.log(err);
  //   }
  //   project = data;
  //   main.loadWindow('web/select-root.html');
  // });
  worker.send({ type: 'proj_data', data: data, appPath: app.getAppPath() });

});

ipcMain.on('methods-req', function (event, data) {
  event.sender.send('methods-res', hierarchyParser.getAllSigs(project.data));
});

ipcMain.on('root-select', function (event, root) {

    // fork??

    //visData = visBuilder.buildVisData(project, root);

    worker.send({ type: 'vis_data', project:  project, root: root });

    // main.loadWindowResize("web/vis.html", 950, 750);

});

worker.stdout.on('data', function(data) {
    console.log('stdout: ' + data);
    //Here is where the output goes
});
worker.stderr.on('data', function(data) {
    console.log('stderr: ' + data);
    //Here is where the error output goes
});
worker.on('close', function(code) {
    console.log('closing code: ' + code);
    //Here you can get the exit code of the script
});

worker.on('message', function (data) {

  console.log(data);

  switch(data.type) {
    case 'proj_data':
      project = data.data;
      main.loadWindow('web/select-root.html');
      break;
    case 'vis_data':
      visData = data.data;
      main.loadWindowResize("web/vis.html", 950, 750);
      break;
    default:
      console.log('ERR: parnet bad event!');
  }

});


ipcMain.on('data-req', function (event) {
  event.sender.send('data-res', visData);
});

function get_dirs() {
    return dialog.showOpenDialog({
      properties: [ 'openDirectory', 'multiSelections' ] });
}

function get_paths() {
    return dialog.showOpenDialog({
    properties: [ 'openDirectory', 'openFile', 'multiSelections' ] });
}