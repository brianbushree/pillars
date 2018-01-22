/**
 *  Profiler.js
 *
 *     run profiler and parse output
 *      into project.profile
 */
const cp = require('child_process');
const fs = require('fs');
const path = require('path');
// let appPath;

class Profiler {

  constructor(appPath) {
    this.appPath = appPath;
  }

  /**
   *
   */
  runProfiler(project, callback) {

    const agentJar = this.appPath + '/profiler/agent-0.1-SNAPSHOT.jar';
    this._execProgram(agentJar, project.jar, project.packages, project.runargs, callback);

  }

  _execProgram(agentJar, appJar, agentArgs, appArgs, callback) {

    // 'cd' into $app$/profiler
    let cwd = process.cwd();
    process.chdir(this.appPath + '/profiler');

    // spawn child thread
    let child = cp.spawn('java', ['-javaagent:' + agentJar + '=' + agentArgs.join(','), '-jar', appJar].concat(appArgs));

    // enforce utf8
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

      // 'cd' to previous
      process.chdir(cwd);

      callback(null, this._parseLog());
    }.bind(this));
  }

  _parseLog() {
    return this._parseThread(1);
  }

  _parseThread(thread) {
    const log = this.appPath + '/profiler/out/thread_' + thread + '.txt';
    let contents = fs.readFileSync(log, 'utf8');
    return this._parseMethodCalls(contents);
  }

  _parseMethodCalls(log) {

    const methodOutRegex = /(.*(?:.*){1}) : start(?=(?:.|\n)*?\1 : (\d+)\n)/gm;

    let match;
    let calls = [];

    while( (match = methodOutRegex.exec(log)) !== null) {

      this._putMethod(calls, match[1].replace(/^\t+/g, ''), (match[1].match(/\t/g) || []).length, match[2]);

    }

    return calls;

  }

  _putMethod(arr, sig, indent, data) {

    if (indent == 0) {

      if (sig == "Thread.start()") {

        arr.push({ sig: sig, time: null, callees: this._parseThread(+data) });

      } else {

        arr.push({ sig: sig, time: +data, callees: [] });

      }

    } else {

      if (arr.length == 0) {
        console.err("ERROR: bad indentation in file!");
        return;
      }

      this._putMethod(arr[arr.length - 1].callees, sig, indent - 1, data);

    }

  }
}

exports.Profiler = Profiler;