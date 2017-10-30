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
  let execStr;
  let stdout;

  async.each(project.data, function(c, callback) {

    newMethods = [];

    async.each(c.methods, function(m, cb) {

      execStr = 'java -jar "' + chpJar + '" -m ' + (c.name + '.' + m.name) + ' -s "' + project.src + '" -c "' + project.classpath + '"';

      console.log(execStr);

      stdout = execSync(execStr).toString();
      stdout = handleFuncOverload(stdout, m.sig);
      callees = extractCallees(stdout);
      m.callees = callees;

      console.log(stdout);
      console.log(callees);

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
      } else {
        console.log("e: " + e);
        console.log("sig: " + sig);
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