/**
 *  Profiler.js
 *
 *     run profiler and parse output
 *      into project.profile
 */
const cp = require('child_process');
const async = require('async');
const fs = require('fs');
const path = require('path');
let appPath;

/**
*  Using project input, for each
*   class, for each method run CHP.
*  
*  @param {Object} project 
*  @return {String} project.data 
*/
// TODO add callback
function runHierarchyParser(project, appP, callback) {

  appPath = appP;

  const agentJar = appPath + '/profiler/agent-0.1-SNAPSHOT.jar';
  const appJar = appPath + '/profiler/test-0.1-SNAPSHOT.jar';
  const agentArgs = ['test'];
  const appArgs = [];

  execProgram(agentJar, appJar, agentArgs, appArgs, callback);

}
module.exports.runHierarchyParser = runHierarchyParser;

// TODO add callback
function execProgram(agentJar, appJar, agentArgs, appArgs, callback) {

  let child = cp.spawn('java', ['-javaagent:' + agentJar + '=' + agentArgs.join(','), '-jar', appJar].concat(appArgs));

  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdin.setEncoding('utf8');

  // redirect child stdout & stderrr
  child.stdout.on('data', function(data) {
    process.send({ type: 'exec_out', data: data });
  });

  child.stderr.on('data', function(data) {
    process.send({ type: 'exec_out', data: data });
  });

  // child.stdin = worker.stdin
  process.stdin.on('data', function(data) {
    child.stdin.write(data);
  });

  // close
  child.on('close', function(code, sig) {
    // process.send({ type: 'exec_close', data: parseLog()});
    callback(null, parseLog());
  });
}

function parseLog() {
  return parseThread(1);
}

function parseThread(thread) {
  const log = appPath + '/logger_profile.out.' + thread;
  let contents = fs.readFileSync(log, 'utf8');
  return parseMethodCalls(contents);
}

function parseMethodCalls(log) {

  const methodOutRegex = /(.*(?:.*){1}) : start(?=(?:.|\n)*?\1 : (\d+)\n)/gm;

  let calls = [];

  while( (match = methodOutRegex.exec(log)) !== null) {

    putMethod(calls, match[1].replace(/^\t+/g, ''), (match[1].match(/\t/g) || []).length, match[2]);

  }

  return calls;

}

function putMethod(arr, sig, indent, data) {

  if (indent == 0) {

    if (sig == "Thread.start()") {

      arr.push({ sig: sig, time: null, callees: parseThread(+data) });

    } else {

      arr.push({ sig: sig, time: +data, callees: [] });

    }

  } else {

    if (arr.length == 0) {
      console.err("ERROR: bad indentation in file!");
      return;
    }

    putMethod(arr[arr.length - 1].callees, sig, indent - 1, data);

  }

}





/********** GETTERS **********/

// TODO add to Project as a method (Classes)
function getAllNames(data) {
  let names = [];
  async.eachSeries(data, function(c, callback) {
    async.eachSeries(c.methods, function(m, cb) {
        
      names.push(c.name + '.' + m.name);

      cb();
    });
    callback();
  });

  return names;
}
module.exports.getAllNames = getAllNames;

function getClasses(data) {
  let classes = [];
  let cl;
  async.eachSeries(data, function(c, callback) {
    cl = { 'name': c.name, 'sigs': [] };
    async.eachSeries(c.methods, function(m, cb) {
      cl.sigs.push(m.sig);
      cb();
    });
    classes.push(cl);
    callback();
  });

  return classes;
}
module.exports.getClasses = getClasses;

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