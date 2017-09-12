/**
 *  ProjectMaker.js
 *
 *     make/load projects to visualize
 */
const electron = require('electron');
const dialog = electron.dialog;
const fs = require('fs');
const javapParser = require('./javap-parser/Javap-Parser.js');

/**
 *  Load a project into application
 *
 */
function loadProject() {
  getClasses(function(classes){
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
  });
}
module.exports.loadProject = loadProject

/**
 *  Ask user for a directory and parse
 *   'javap' output
 *
 *  @param callback
 */
function getClasses(callback) {

  /* ask user for directory */
  let dirs = dialog.showOpenDialog({
      properties: [ 'openDirectory' ] });

  javapParser.parseAsync(dirs[0], function(err, res) {
    callback(res);
  });
}