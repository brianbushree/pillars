/**
 *  Hierarchy-Parser.js
 *
 *     run call-hierarchy-printer and parse input
 *      into each method's callees
 */
const execSync = require('child_process').execSync;
const async = require('async');
const {app} = require('electron');

function runHierarchyParser(classes) {

	const appPath = app.getAppPath();
	const chpJar = appPath + '/hierarchy-parser/org.chp-1.0.jar';

	let methodName;
	let srcDir;
	let classpath;

	srcDir = getSrcDir();
	classpath = getClasspath();

	// async.each(classes, function(c, callback) {
		methodName = 'test.ArrayOperations.main';
		let stdout = execSync('java -jar "' + chpJar + '" -m ' + methodName + ' -s "' + srcDir + '" -c "' + classpath + '"').toString();
		console.log(stdout);
	// });

}
module.exports.runHierarchyParser = runHierarchyParser;

function getSrcDir() {
	/* ask user for directory */
	// let dirs = dialog.showOpenDialog({
	//   properties: [ 'openDirectory' ] });

	return '/Users/brianbush/Desktop/lab3\\ test';
}

/*
*	For every dir found in classpath, copy '.class'
*     files into newDir and replace with new dir in classpath string
*	
*	WHY? CHP classpath dirs must only contain .class files
*/ 
function getClasspath() {

	/* ask user for classpath OR default */

	return '/Users/brianbush/Desktop/test path';
}
