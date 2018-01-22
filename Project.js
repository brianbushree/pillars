const javapParser = require('./javap-parser/Javap-Parser.js');
const profiler = require('./profiler/Profiler.js');

class Project {

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
	constructor (class_dirs, src_dirs, classpath, jar, runargs, packages) {

		this.class_dirs = class_dirs;
		this.src_dirs = src_dirs;
		this.classpath = classpath;
		this.jar = jar;
		this.runargs = runargs;
		this.packages = packages;

		this.class_data = null;
		this.exec_data = null;

	}


	/**
	 * Runs javap parser, profiler, and callback respectively.
	 *
	 * @param {Object} proj  serialized Project
	 * @param {string} appPath  path of app root
	 * @param {Function} callback(err, data)  callback function
	 */
	static buildProject (proj, appPath, callback) {

		let ret_data = {};

	    // Run javap parser
	    javapParser.parseAsync(proj.class_dirs, function(err, res) {
	      ret_data.class_data = res;

	      // Run Profiler
	      profiler.runProfiler(proj, appPath,
	        function(err, data) {

	          ret_data.exec_data = data;

	          // TODO decide if stopping before building vis_data is necessary

	          callback(err, ret_data);

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

exports.Project = Project;