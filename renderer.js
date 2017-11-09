const {ipcRenderer} = require('electron');
let project = {
	'class_dirs' : null,
	'src' : null,
	'classpath': null
};

function start() {
	project.class_dirs = null;
	project.src = null;
	project.classpath = null;
	ipcRenderer.send('start');
}

function load_existing() {
	ipcRenderer.send('load_existing');
}

function load_new() {
	ipcRenderer.send('load_new');
}

function class_prompt() {
	ipcRenderer.send('class_prompt');
}

ipcRenderer.on('class_rec', function(e, data) {
	project.class_dirs = data;
	add_files_to_elem('proj-classes', data);
});

function src_prompt() {
	ipcRenderer.send('src_prompt');
}

ipcRenderer.on('src_rec', function(e, data) {
	project.src = data;
	add_files_to_elem('proj-src', data);
});

function classpath_prompt() {
	ipcRenderer.send('classpath_prompt');
}

ipcRenderer.on('classpath_rec', function(e, data) {
	project.classpath = data;
	add_files_to_elem('proj-classpath', data);
});

function make_project(project) {
	if (project.class_dirs && project.src && project.classpath) {
		alert("run!");
		ipcRenderer.send('load_project', project);
	}
}

function add_files_to_elem(parentID, data) {

	let elem;

	data.forEach(function(e, i) {
		elem = document.createElement('p');
		elem.appendChild(document.createTextNode(e));
		document.getElementById(parentID).appendChild(elem);
	});

}