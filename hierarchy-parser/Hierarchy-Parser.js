/**
 *  Hierarchy-Parser.js
 *
 *     run call-hierarchy-printer and parse input
 *      into each method's callees
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

function runHierarchyParser(project) {

  let callees;
  let newClasses = [];
  let newMethods;
  let execStr;
  let stdout;

  async.eachSeries(project.data, function(c, callback) {

    newMethods = [];

    async.eachSeries(c.methods, function(m, cb) {

      execStr = 'java -jar "' + chpJar + '" -m ' + (c.name + '.' + m.name) + ' -s "' + project.src + '" -c "' + project.classpath + '"';

      stdout = execSync(execStr).toString();
      stdout = handleFuncOverload(stdout, m);
      callees = extractCallees(stdout);
      m.callees = callees;

      console.log(execStr);
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

function extractCallees(stdout) {

  let callees = [];
  let calleeRegex = /^\t((?!java)\S*(?:\(.+\))?)$/gm;
  let match = null;

  while ( (match = calleeRegex.exec(stdout)) !== null ) {
    callees.push(match[1]);
  }

  return callees;

}

function handleFuncOverload(stdout, method) {

  let methodSig;
  let methodsOutput = stdout.split("\n\n");

  if (methodsOutput.length <= 2) {
    stdout = methodsOutput[0];
  } else {
    methodsOutput.forEach(function(e, i) {
      if (e.includes(method.sig + '\n')) {
          stdout = e;
      }
    });
  }

  return stdout;

}