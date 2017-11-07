/**
 *  Hierarchy-Parser.js
 *
 *     run call-hierarchy-printer and parse output
 *      into each method's callees attribute
 */
const execSync = require('child_process').execSync;
const electron = require('electron');
const dialog = electron.dialog;
const async = require('async');
const {app} = require('electron');
const appPath = app.getAppPath();
const fs = require('fs');
const path = require('path');

const chpJar = appPath + '/hierarchy-parser/org.chp-1.0.jar';

/**
*  Using project input, for each
*   class, for each method run CHP.
*  
*  @param {Object} project 
*  @return {String} project.data 
*/
function runHierarchyParser(project) {

  let callees;
  let newClasses = [];
  let newMethods;
  let methodMap;
  let execStr;
  let stdout;
  let out;

  execStr = 'java -jar "' + chpJar + '" -M "' + getAllNames(project.data) + '" -s "' + project.src + '" -c "' + project.classpath + '"';

  console.log(execStr);

  stdout = execSync(execStr).toString();
  methodMap = getMethodMap(stdout);

  async.eachSeries(project.data, function(c, callback) {

    newMethods = [];

    async.eachSeries(c.methods, function(m, cb) {
      out = handleFuncOverload(methodMap[(c.name + '.' + m.name)], m.sig);
      callees = extractCallees(out);
      m.callees = callees;
      newMethods.push(m);
      cb();
    });

    c.methods = newMethods;
    newClasses.push(c);
    callback();
  });

  return newClasses;

}
module.exports.runHierarchyParser = runHierarchyParser;

function getMethodMap(stdout) {

  const methodOutRegex = /^([\S\s]+?)^\[ (\S+) \]$/gm;
  let match;
  let map = {};

  while( (match = methodOutRegex.exec(stdout)) !== null) {
    map[match[2]] = match[1];
  }

  return map;
}

function getAllNames(data) {
  let names = "";
  async.eachSeries(data, function(c, callback) {
    async.eachSeries(c.methods, function(m, cb) {
      names += (c.name + '.' + m.name) + " ";
      cb();
    });
    callback();
  });

  if (names.length > 0) {
    names = names.substring(0, names.length - 1);
  }
  return names;
}

/**
*  Extract direct callees from CHP output.
*
*  @param {String} stdout
*  @return {String[]} callees 
*/
function extractCallees(stdout) {

  const calleeRegex = /^\t((?!java)\S*(?:\(.+\))?)$/gm;
  let callees = [];
  let match = null;

  while ( (match = calleeRegex.exec(stdout)) !== null ) {
    callees.push(match[1]);
  }

  return callees;

}

/**
*  Handle case where method is overloaded
*   using a method's signature.
*
*  @param {String} stdout
*  @param {String} sig
*  @return {String} method
*/
function handleFuncOverload(stdout, sig) {

  let m = undefined;
  let methods = stdout.split("\n\n");

  if (methods.length > 2) {
    methods.forEach(function(e, i) {
      if (e.includes(sig)) {
          m = e;
          return;
      }
    });

    if (!m) {
      console.log("\n\nERROR: no function found");
      m = stdout;
    }

  } else {
    m = stdout;
  }

  return m;

}