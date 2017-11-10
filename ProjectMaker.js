/**
 *  ProjectMaker.js
 *
 *     make/load projects to visualize
 */
const electron = require('electron');
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
function loadProject(project, callback) {

    project.class_dirs = cleanClassDirs(project.class_dirs);
    project.src = cleanSrcDirs(project.src);
    project.classpath = cleanClasspath(project.classpath);

    javapParser.parseAsync(project.class_dirs, function(err, res) {
      project.data = res;
      project.data = hierarchyParser.runHierarchyParser(project);
      printClasses(project.data);
      callback(null, project);
    });

}
module.exports.loadProject = loadProject


function cleanClassDirs(dirs) {
  return dirs;
}

function cleanSrcDirs(dirs) {

  let src = '';

  dirs.forEach(function(e, i) {
    src += e.replace(/ /g, "\\ ") + ((i != dirs.length - 1) ? " " : "");
  });

  return src;

}

function cleanClasspath(paths) {

  let classpath = '';

  paths.forEach(function(f, i) {
    if (fs.lstatSync(f).isDirectory()) {
      classpath += copyDir(f, f, classpath);
    } else {
      classpath += f + ":";
    }
  });

  return classpath;

}

/*
* Copy '.class' files and directory structure
*  into local storage
*/ 
function copyDir(base, dir, cp) {
  
  let cont;
  let files;
  let f;
  let newDir = appPath + '/stor/' + dir.substring(base.lastIndexOf('/') + 1, dir.length);

  if (!fs.existsSync(newDir)) {
    fs.mkdirSync(newDir);   
  }

  cont = false;
  cp.split(':').forEach(function(e, i) {
    if (e != '' && newDir.includes(e)) {
      cont = true;
      return;
    }
  });

  if (!cont) {
    cp += newDir + ':';
  }

  files = fs.readdirSync(dir);
  files.forEach(function(e, i) {

    f = path.join(dir, e);

    if (fs.lstatSync(f).isDirectory()) {

      cp = copyDir(base, f, cp);

    } else if (path.extname(f).toLowerCase() === '.class') {
      fs.createReadStream(f).pipe(fs.createWriteStream(newDir + '/' + path.basename(f)));
    }

  });

  return cp;

}

/**
 *  Print all class_dirs/subclasses and totals.
 *  
 *  @param array of class objs
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