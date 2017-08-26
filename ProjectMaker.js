const electron = require('electron');
const dialog = electron.dialog;

const fs = require('fs');
const path = require('path');
const url = require('url');
const exec = require('child_process').exec;

const javapParser = require('./javap-parser/Javap-Parser.js');

function loadProject() {
  let classes = getClasses(function(classes){
    console.log(JSON.stringify(classes, null, 2));
    let names = [];
    classes.forEach(function(e,i) {
      names.push(classes[i].name);
    });
    console.log(names);
    console.log("Found  " + classes.length + " classes\n");
  });
}

function getClasses(callback) {

  /* ask user for directory */
  let dirs = dialog.showOpenDialog({
      properties: [ 'openDirectory' ] });

  javapParser.parseAsync(dirs[0], function(err, res) {
    callback(res);
  });
}

module.exports.loadProject = loadProject