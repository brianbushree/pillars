/**
 *  ProjectMaker.js
 *
 *     make/load projects to visualize
 */
const electron = require('electron');
const dialog = electron.dialog;
const fs = require('fs');
const path = require('path');
const {app} = require('electron');
const appPath = app.getAppPath();

const javapParser = require('./javap-parser/Javap-Parser.js');
const hierarchyParser = require('./hierarchy-parser/Hierarchy-Parser.js');

/**
 *  Load a project into application
 *
 */
function loadProject() {
  getProjectInput(function(project) {

    javapParser.parseAsync(project.classes, function(err, res) {
      project.data = res;
      printClasses(project.data);
      project.data = hierarchyParser.runHierarchyParser(project);
    });

  });
}
module.exports.loadProject = loadProject

/**
 *  Ask user for a 'classes' dir,
 *   'src' dir,
 *   and 'classpath'.
 *
 *  @param callback(project)
 *    
 *    project format:
 *    {
 *      'classes': CLASSES_DIR,
 *      'src': SRC_DIR,
 *      'classpath': CLASSPATH_STR
 *    }
 */
function getProjectInput(callback) {
  let project = {};
  let paths;

  paths = dialog.showOpenDialog({
      properties: [ 'openDirectory' ] });
  project.classes = paths[0];

  paths = dialog.showOpenDialog({
      properties: [ 'openDirectory' ] });
  project.src = '';
  paths.forEach(function(e,i) {
    project.src += e.replace(/ /g, "\\ ") + ((i != paths.length - 1) ? " " : "");
  });

  project.classpath = '';
  paths = dialog.showOpenDialog({
    properties: [ 'openDirectory', 'openFile', 'multiSelections' ] });

  paths.forEach(function(f,i) {
    if (fs.lstatSync(f).isDirectory()) {
      project.classpath += copyDir(f, f);
    } else {
      project.classpath += f + ":";
    }
  });

  callback(project);

}

/*
* Copy '.class' files and directory structure
*  into local storage
*/ 
function copyDir(base, dir) {

  let cp = "";
  let newDir = appPath + '/stor/' + dir.substring(base.lastIndexOf('/') + 1, dir.length);

  if (!fs.existsSync(newDir)) {
    fs.mkdirSync(newDir);   
  }

  cp += newDir + ':';

  let files = fs.readdirSync(dir);
  files.forEach(function(e, i) {

    let f = path.join(dir, e);

    if (fs.lstatSync(f).isDirectory()) {
      cp += copyDir(base, f);
    } else if (path.extname(f).toLowerCase() === '.class') {
      fs.createReadStream(f).pipe(fs.createWriteStream(newDir + '/' + path.basename(f)));
    }

  });

  return cp;
}

/**
 *  Print all classes/subclasses and totals.
 *  
 *  @param array of classes 
*/
function printClasses(classes) {

  let names = [];
  let subnames = [];

  classes.forEach(function(e,i) {
    names.push(classes[i].filebase);
    if (e.subclasses.length > 0) {
      e.subclasses.forEach(function(d,j) {
        subnames.push(d.filebase);
      });
    }
  });

  console.log(JSON.stringify(classes, null, 2));
  console.log(names);
  console.log("Found  " + names.length + " classes\n");
  console.log(subnames);
  console.log("Found  " + subnames.length + " subclasses\n");
  console.log("Total:  " + (names.length + subnames.length) + "\n");

}