const {ipcRenderer} = require('electron');

function start() {
	ipcRenderer.send('start');
}

let project = {
	'class_dirs' : [],
	'src' : [],
	'classpath': []
};
let loading = null;

function make_project(project) {
	if (project.class_dirs.length && project.src.length && project.classpath.length) {
		alert("run!");
		ipcRenderer.send('load_project', project);
	}
	start_loading();
}

function start_loading() {
	loading = window.setInterval(function() {
		let l = document.getElementById('loading');
		if (l.textContent.length < 5) {
			l.textContent += "-"
		} else {
			l.textContent = "-"
		}
	}, 1000);
}


function class_prompt() {
	ipcRenderer.send('class_prompt');
}

function src_prompt() {
	ipcRenderer.send('src_prompt');
}

function classpath_prompt() {
	ipcRenderer.send('classpath_prompt');
}

ipcRenderer.on('class_rec', function(e, data) {
	add_files_to_elem('proj-classes', data, project.class_dirs.length);
	project.class_dirs = project.class_dirs.concat(data);
});

ipcRenderer.on('src_rec', function(e, data) {
	add_files_to_elem('proj-src', data, project.src.length);
	project.src = project.src.concat(data);
});

ipcRenderer.on('classpath_rec', function(e, data) {
	add_files_to_elem('proj-classpath', data, project.classpath.length);
	project.classpath = project.classpath.concat(data);
});

function add_files_to_elem(parentID, data, offset) {

	let elem;
	let a;

	if (!data) {
		return;
	}

	data.forEach(function(e, i) {
		elem = document.createElement('p');
		a = document.createElement('a');
		a.appendChild(document.createTextNode('remove'));
		a.setAttribute('href', '#');
		a.setAttribute('onclick', 'remove_file_from_list(this, ' + (offset + i) + '); return false;');
		elem.appendChild(document.createTextNode(e + " "));
		elem.appendChild(a);
		document.getElementById(parentID).appendChild(elem);
	});

}

function remove_all_from_node(parent) {
	while(parent.firstChild) {
	    parent.removeChild(parent.firstChild);
	}
}

function remove_file_from_list(child, index) {

	let arr;
	let cpy;
	let parent = child.parentNode.parentNode;
	
	if (parent.getAttribute('id') == 'proj-classes') {
		arr = project.class_dirs;
	} else if (parent.getAttribute('id') == 'proj-src') {
		arr = project.src;
	} else if (parent.getAttribute('id') == 'proj-classpath') {
		arr = project.classpath;
	}

	cpy = arr.slice();
	cpy.splice(index, 1);

	arr.splice(0, arr.length);
	remove_all_from_node(parent);
	add_files_to_elem(parent.getAttribute('id'), cpy, 0);

	if (parent.getAttribute('id') == 'proj-classes') {
		project.class_dirs = cpy;
	} else if (parent.getAttribute('id') == 'proj-src') {
		project.src = cpy;
	} else if (parent.getAttribute('id') == 'proj-classpath') {
		project.classpath = cpy;
	}

}