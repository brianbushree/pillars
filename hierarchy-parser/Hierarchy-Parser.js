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

	let srcDir;
	let classpath;
	let callees;

	srcDir = getSrcDir();
	classpath = getClasspath();

	let newClasses = [];

	async.eachSeries(classes, function(c, callback) {
		let newMethods = [];
		async.eachSeries(c.methods, function(m, cb) {
			let execStr = 'java -jar "' + chpJar + '" -m ' + (c.name + '.' + m.name) + ' -s "' + srcDir + '" -c "' + classpath + '"';
			let stdout = execSync(execStr).toString();
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

	let c = undefined;
	while ( (c = calleeRegex.exec(stdout)) !== null ) {
		callees.push(c[1]);
	}

	return callees;
}

function handleFuncOverload(stdout, method) {

	let methodSig;
	let methodsOutput;

	methodsOutput = stdout.split("\n\n");

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
*     files into newDir and replace with new dir in classpath
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
	files.forEach(function(e, i) {

		let f = path.join(dir, e);

		if (fs.lstatSync(f).isDirectory()) {
			cp += copyDir(base, f);
		} else if (path.extname(f).toLowerCase() === '.class') {
			fs.createReadStream(f).pipe(fs.createWriteStream(newDir + '/' + path.basename(f)));
		}

	});

	return cp;
}
