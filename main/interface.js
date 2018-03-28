/**
 *
 *  interface.js
 *
 *     Handle events from main window and dictate
 *      control flow.
 */
const electron = require('electron');
const { ipcMain } = electron;
const { app } = electron;
const dialog = electron.dialog;
const fs = require('fs');
const { fork } = require('child_process');
const main = require('./main.js');
const profiler = require('./profiler/Profiler.js');
const { Project } = require('./Project.js');
const { ProjectStore } = require('./ProjectStore.js');

let store = new ProjectStore(app.getAppPath() + '/stor');
let project = null;
let proj = null;


/* 
  
    1. Intro page

*/

/* -------------------------------------------------*/
/* index.html                                       */
/* -------------------------------------------------*/
ipcMain.on('start', function (event) {
  main.loadWindow('web/index.html');
});


/*
    
    2. Begin loading project

*/

/* -------------------------------------------------*/
/* load-existing.html                               */
/* -------------------------------------------------*/
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

/* -------------------------------------------------*/
/* load-new.html                                    */
/* -------------------------------------------------*/
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
       + Build exec data

*/
function load_project(event, data, save) {

  // save
  if (save) {
    store.storeSync(data);
  }

  // make project
  project = new Project(data.class_dirs, data.src_dirs, data.classpath, data.jar, data.runargs, data.packages, null, null);

  // send stringified project
  worker.send({ type: 'proj_data', proj: data, appPath: app.getAppPath() });

  // load exec window
  main.loadWindow('web/exec.html');

}

ipcMain.on('load_project', load_project);

/* -------------------------------------------------*/
/* exec.html                                        */
/* -------------------------------------------------*/

let exec_buf = '';

ipcMain.on('exec_send', function (event, val) {
  exec_buf += val;
  worker.stdin.write(val);
});

ipcMain.on('exec_req', function (event, root) {
  event.sender.send('exec-res', exec_buf);
});


/*
    
    4. Visualization

*/

/* -------------------------------------------------*/
/* vis.html                                         */
/* -------------------------------------------------*/

ipcMain.on('data-req', function (event) {
  event.sender.send('data-res', project.visData);
});


/*
    
    Worker Thread
      execute program
      build exec data
      build vis data
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

      project = new Project(data.proj.class_dirs, data.proj.src_dirs, data.proj.classpath, data.proj.jar, data.proj.runargs, data.proj.packages, data.proj.class_data, data.proj.exec_data);
      project.visData = data.proj.visData;

      main.loadWindowResize("web/vis.html", 1200, 800);
      break;

    default:
      console.log('ERR: parnet bad event!');
  }

});