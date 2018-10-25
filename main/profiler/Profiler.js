/**
 *  Profiler.js
 *
 *     run profiler and parse output
 *      into project.profile
 */
const cp = require('child_process');
const fs = require('fs');
const rootProto = require("./method_call.js")

exports.Profiler = class Profiler {

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
    this._execProgram(agentJar, project.jar, project.packages, project.runargs, project.root_dir, callback);

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
  _execProgram(agentJar, appJar, agentArgs, appArgs, rootDir, callback) {

    // 'cd' into root_dir
    let cwd = process.cwd();
    process.chdir(rootDir);

    // spawn child thread
    const logOut = this.appPath + '/main/profiler/out';
    let child = cp.spawn('java', ['-javaagent:' + agentJar + '=' + logOut + '###' + agentArgs.join(','), '-jar', appJar].concat(appArgs));

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
    
    // decode/load
    let threadData = rootProto.agent.MethodCall.decode(fs.readFileSync(log));

    // compress threads & fix call.depth
    threadData.calls.forEach(function(call, index) {
      if (call.type == 1) {   // call.type == MethodCallType.THREAD_START
        let addToNodes = function(mcall, add) {
          mcall.calls.forEach(function(c, i) {
            c.depth += call.depth;
            if (c.calls.length != 0) {
              addToNodes(c, add);
            }
          });
        }
        let nestedThread = this._parseThread(call.newThreadId)
        addToNodes(nestedThread, call.depth);
        call.calls.push(nestedThread);
      }
    }.bind(this));

    return threadData;
  }

}