/**
 *
 *  Project.js 
 *
 *     Class that represents a Java project to be
 *      built/loaded into the visualization.
 */
const javapParser = require('./javap-parser/Javap-Parser.js');
const { Profiler } = require('./profiler/Profiler.js');
const srcFinder = require('./SourceFinder.js');

exports.Project = class Project {

    /**
     * Creates a Project given user input.
     *
     * @param {Array<string>} class_dirs  directories of .class files
     * @param {Array<string>} src_dirs  directories of .java files
     * @param {Array<string>} classpath  paths of classpath var
     * @param {string} jar  path to program jar
     * @param {Array<string>} runargs  runtime arguements
     * @param {Array<string>} packages  packages to trace
     */
    constructor(class_dirs, src_dirs, classpath, jar, runargs, packages, class_data, exec_data) {

        this.class_dirs = class_dirs;
        this.src_dirs = src_dirs;
        this.classpath = classpath;
        this.jar = jar;
        this.runargs = runargs;
        this.packages = packages;

        this.class_data = class_data;
        this.exec_data = exec_data;

    }


    /**
     * Runs javap parser, profiler, and callback respectively.
     *
     * Note: static to handle serialized project in worker
     *
     * @param {Object} proj  serialized Project
     * @param {string} appPath  path of app root
     * @param {Function} callback(err)  callback function
     */
    static buildProject(proj, appPath, callback) {

        // Run javap parser
        javapParser.parseAsync(proj.class_dirs, function(err, class_data) {

          proj.class_data = class_data;

          // Find source files + assign to class_data
          srcFinder.addSrcFiles(proj, function(err) {

              let profiler = new Profiler(appPath);

              // Run Profiler
              profiler.runProfiler(proj, function(err, exec_data) {

                  proj.exec_data = exec_data;

                  // TODO decide if stopping before building vis_data is necessary

                  callback(err);

              });

          });

        });

    }

    /**
     * Gets the signatures of every method.
     *
     * @return {Array<string>} names  signatures of every method in
     *                                 class_data
     */
    getAllNames() {
      let names = [];
      this.class_data.forEach(function(cls) {
        cls.methods.forEach(function (mthd) {
          names.push(cls.name + '.' + mthd.name);
        });
      });
      return names;
    }

    /**
     * Gets the names of every class.
     *
     * @return {Array<string>} names  names of every class in
     *                                 class_data
     */
    getClasses() {
      let classes = [];
      let cl;

      this.class_data.forEach(function(cls) {
        cl = { 'name': cls.name, 'sigs': [] };
        cls.methods.forEach(function (mthd) {
          cl.sigs.push(mthd.sig);
        });
        classes.push(cl);
      });

      return classes;
    }

}