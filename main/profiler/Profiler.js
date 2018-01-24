/**
 *  Profiler.js
 *
 *     run profiler and parse output
 *      into project.profile
 */
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

class Profiler {

  /**
   * Creates a Profiler given the app's root.
   *
   * @param {string} appPath  app's root path
   */
  constructor(appPath) {
    this.appPath = appPath;
  }

  /**
   * Profiles a given project and calls callback.
   *
   * @param {Object} proj  serialized Project
   * @param {Function} callback(err, data)  callback function
   */
  runProfiler(project, callback) {

    const agentJar = this.appPath + '/main/profiler/agent-0.1-SNAPSHOT.jar';
    this._execProgram(agentJar, project.jar, project.packages, project.runargs, callback);

  }

  /**
   * Executes profiler, parses data, and calls callback.
   *
   * @param {string} agentJar  path to agent jar
   * @param {string} appJar  path to program jar
   * @param {Array<string>} agentArgs  agent arguements
   * @param {Array<string>} appArgs  program arguements
   * @param {Function} callback(err, data)  callback function
   */
  _execProgram(agentJar, appJar, agentArgs, appArgs, callback) {

    // 'cd' into $app$/profiler
    let cwd = process.cwd();
    process.chdir(this.appPath + '/main/profiler');

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

  /**
   * Parse main thread's output.
   *
   * @return {Array<Object>} main thread's calls
   */
  _parseLog() {
    return this._parseThread(1);
  }

  /**
   * Parse a given thread's output.
   *
   * @param {number} thread  thread to parse
   * @return {Array<Object>} given thread's calls
   */
  _parseThread(thread) {
    const log = this.appPath + '/main/profiler/out/thread_' + thread + '.txt';
    let contents = fs.readFileSync(log, 'utf8');
    return this._parseMethodCalls(contents);
  }

  /**
   * Given log output, parses its calls.
   *
   * @param {string} log  contents of log file
   * @return {Array<Object>} calls  method calls and children
   */
  _parseMethodCalls(log) {

    const methodOutRegex = /(.*(?:.*){1}) : start(?=(?:.|\n)*?\1 : (\d+)\n)/gm;

    let match;
    let calls = [];

    while( (match = methodOutRegex.exec(log)) !== null) {

      this._putMethod(calls, match[1].replace(/^\t+/g, ''), (match[1].match(/\t/g) || []).length, match[2]);

    }

    return calls;

  }

  /**
   * Add method to specified array.
   *
   * @param {Array<Object>} arr  array to add to
   * @param {string} sig  signature of the method
   * @param {number} indent  method's level of indentation
   * @param {string} data  time/thread data to include
   */
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