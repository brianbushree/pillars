const electron = require('electron');
const {ipcMain} = electron;
const {app} = electron;
const dialog = electron.dialog;
const profiler = require('./profiler/Profiler.js');
const main = require('./main.js');
const fs = require('fs');
const { fork } = require('child_process');
const { Project } = require('./Project.js');
const { ProjectStore } = require('./ProjectStore.js');

let store = new ProjectStore(app.getAppPath() + '/stor');
let project = null;
let proj = null;


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

ipcMain.on('proj_stor_req', function (event) {
  store.getAllNames(function (err, names) {
    event.sender.send('proj_stor_res', names);
  });
});

ipcMain.on('proj_del', function (event, name) {
  store.deleteSync(name);
});

ipcMain.on('proj_stor_select', function(event, name) {

  store.getProject(name, function(err, project) {
    load_project(event, project, false);
  });

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
function load_project(event, data, save) {

  // save
  if (save) {
    store.storeSync(data);
  }

  // make project
  project = new Project(data.class_dirs, data.src_dirs, data.classpath, data.jar, data.runargs, data.packages);

  // send stringified project
  worker.send({ type: 'proj_data', data: data, appPath: app.getAppPath() });

  // load exec window
  main.loadWindow('web/exec.html');

}

ipcMain.on('load_project', load_project);

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
  event.sender.send('classes-res', project.getClasses());
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
  event.sender.send('data-res', project.visData);
});


/*
    
    Worker Thread
      execute program
      build data
*/

let worker = fork('main/worker.js', [],
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
      project.class_data = data.data.class_data;
      project.exec_data = data.data.exec_data;
      main.loadWindow('web/select-root.html');
      break;

    case 'vis_data':    /* vis data complete */
      project.visData = data.data;
      main.loadWindowResize("web/vis.html", 1050, 800);
      break;

    default:
      console.log('ERR: parnet bad event!');
  }

});