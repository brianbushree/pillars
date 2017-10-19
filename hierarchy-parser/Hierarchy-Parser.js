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

function runHierarchyParser(project) {

	const chpJar = appPath + '/hierarchy-parser/org.chp-1.0.jar';

	let callees;
	let newClasses = [];

	async.eachSeries(project.data, function(c, callback) {
		let newMethods = [];
		async.eachSeries(c.methods, function(m, cb) {
			let execStr = 'java -jar "' + chpJar + '" -m ' + (c.name + '.' + m.name) + ' -s "' + project.src + '" -c "' + project.classpath + '"';
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