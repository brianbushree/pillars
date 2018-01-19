const electron = require('electron');
const {ipcMain} = electron;
const {app} = electron;
const dialog = electron.dialog;
const profiler = require('./profiler/Profiler.js');
const main = require('./main.js');
const { fork } = require('child_process');

let project = null;
let visData = null;


/* 
  
    1. Splash page

    index.html

*/

ipcMain.on('start', function (event) {
  main.loadWindow('web/index.html');
});


/*
    
    2. Begin loading project

      load-existing.html ||
      load-new.html

*/

ipcMain.on('load_existing', function (event) {
  main.loadWindow('web/load-existing.html');
});

ipcMain.on('load_new', function (event) {
  main.loadWindow('web/load-new.html');
});

ipcMain.on('class_prompt', function (event) {
  event.sender.send('class_res', get_dirs());
});

ipcMain.on('src_prompt', function (event) {
  event.sender.send('src_res', get_dirs());
});

ipcMain.on('classpath_prompt', function (event) {
  event.sender.send('classpath_res', get_paths());
});

ipcMain.on('jar_prompt', function (event) {
  event.sender.send('jar_res', get_jar());
});

function get_dirs() {
    return dialog.showOpenDialog({
      properties: [ 'openDirectory', 'multiSelections' ] });
}

function get_paths() {
    return dialog.showOpenDialog({
    properties: [ 'openDirectory', 'openFile', 'multiSelections' ] });
}

function get_jar() {
    return dialog.showOpenDialog({
      filters: [{name: 'JAR', extensions: ['jar']}],
      properties: [ 'openFile' ] });
}


/*
    
    3. Execute Program with logging

      exec.html - display terminal

*/
ipcMain.on('load_project', function (event, data) {
  worker.send({ type: 'proj_data', data: data, appPath: app.getAppPath() });
  main.loadWindow('web/exec.html');
});

let exec_buf = '';

ipcMain.on('exec_send', function(event, val) {
  exec_buf += val;
  worker.stdin.write(val);
});

ipcMain.on('exec_req', function (event, root) {
  event.sender.send('exec-res', exec_buf);
});


/*
    
    4. Scoping - select root?

*/
ipcMain.on('classes-req', function (event, data) {
  event.sender.send('classes-res', profiler.getClasses(project.data));
});

ipcMain.on('root-select', function (event, root) {
    worker.send({ type: 'vis_data', project:  project, root: root });
});


/*
    
    5. Visualization

*/
ipcMain.on('new_root', function (event, root) {
   main.loadWindow('web/select-root.html');
});

ipcMain.on('data-req', function (event) {
  event.sender.send('data-res', visData);
});


/*
    
    Worker Thread
      execute program
      build data
*/

let worker = fork('worker.js', [],
 { stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ] });

worker.stdout.on('data', function(data) {
    console.log('stdout: ' + data);
});
worker.stderr.on('data', function(data) {
    console.log('stderr: ' + data);
});

worker.on('message', function (data) {

  switch(data.type) {
    case 'exec_out':    /* print to buf */
      exec_buf += data.data;
      break;

    case 'proj_data':   /* project data complete */
      project = data.data;
      main.loadWindow('web/select-root.html');
      break;

    case 'vis_data':    /* vis data complete */
      visData = data.data;
      main.loadWindowResize("web/vis.html", 1050, 800);
      break;

    default:
      console.log('ERR: parnet bad event!');
  }

});