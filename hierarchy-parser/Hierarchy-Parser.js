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

function runHierarchyParser(classes) {

	const chpJar = appPath + '/hierarchy-parser/org.chp-1.0.jar';

	let methodName;
	let srcDir;
	let classpath;

	srcDir = getSrcDir();
	classpath = getClasspath();

	// async.each(classes, function(c, callback) {
		methodName = 'test.ArrayOperations.main';
		let execStr = 'java -jar "' + chpJar + '" -m ' + methodName + ' -s "' + srcDir + '" -c "' + classpath + '"';
		let stdout = execSync(execStr).toString();
		console.log(stdout);
		console.log(execStr);
	// });

}
module.exports.runHierarchyParser = runHierarchyParser;

function getSrcDir() {

	let paths = dialog.showOpenDialog({
	  properties: [ 'openDirectory', 'multiSelections' ] });
	let dirs = "";

	paths.forEach(function(e,i) {
		dirs += e.replace(/ /g, "\\ ") + ((i != paths.length - 1) ? " " : "");
	});

	return dirs;
}

/*
*	For every dir found in classpath, copy '.class'
*     files into newDir and replace with new dir in classpath string
*	
*	WHY? CHP classpath dirs must only contain .class files
*/ 
function getClasspath() {

	let cp = "";

	let paths = dialog.showOpenDialog({
	  properties: [ 'openDirectory', 'openFile', 'multiSelections' ] });

	paths.forEach(function(e,i) {
		let f = e;
		if (fs.lstatSync(f).isDirectory()) {

			cp += copyDir(f, f);

		} else {

			cp += f + ":";
		}
	});

	return cp;

}

function copyDir(base, dir) {

	let cp = "";
	let newDir = appPath + '/stor/' + dir.substring(base.lastIndexOf('/') + 1, dir.length);

	if (!fs.existsSync(newDir)) {
		fs.mkdirSync(newDir);		
	}

	cp += newDir + ':';

	let files = fs.readdirSync(dir);
	// fs.readdir(dir, function(err, files) {
		files.forEach(function(e, i) {

			let f = path.join(dir, e);

			if (fs.lstatSync(f).isDirectory()) {
				cp += copyDir(base, f);
			} else if (path.extname(f).toLowerCase() === '.class') {
				fs.createReadStream(f).pipe(fs.createWriteStream(newDir + '/' + path.basename(f)));
			}

		});
	// });

	return cp;
}
