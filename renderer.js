const {ipcRenderer} = require('electron');
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
	}, 100);
}

ipcRenderer.on('methods-res', function(e, sigs) {
	console.log(sigs);
	// clearInterval(loading);
	add_methods(sigs);
});

function add_methods(sigs) {
	let cont = document.getElementById('methods');
	let elem;
	let a;

	sigs.forEach(function(e, i) {

		elem = document.createElement('p');
		elem.setAttribute('class', 'method')
		elem.appendChild(document.createTextNode(e + ' '));
		a = document.createElement('a');
		a.appendChild(document.createTextNode('select'));
		a.setAttribute('href', '#');
		a.setAttribute('onclick', 'select_method(this);  return false;');


		elem.appendChild(a);
		cont.appendChild(elem);

	});
}

function select_method(link) {
	let parent = link.parentNode;
	let cls;
	parent.setAttribute('style', 'color: red;');
	deselect_all_methods(parent);
	add_class(parent, 'selected');
}

function deselect_all_methods(parent) {

	let all = document.querySelectorAll('.method.selected');

	for (let e of all) {
		remove_class(e, 'selected')
		e.setAttribute('style', '');
	}

}

function add_class(e, name) {
	let cls = e.getAttribute('class').split(' ');
	cls.push(name);
	e.setAttribute('class', cls.join(' '));
}

function remove_class(e, name) {
	let cls = e.getAttribute('class').split(' ');
	let i;

	if ( (i = cls.indexOf(name)) != -1) {
		cls.splice(i, 1);
	}

	e.setAttribute('class', cls.join(' '));
}

function select_root() {

	let m = document.querySelector('.method.selected');

	if (m) {
		ipcRenderer.send('root-select', m.textContent.substring(0, m.textContent.lastIndexOf(' ')));
	} else {
		alert('no root selected - showing all');
		ipcRenderer.send('root-select', null);
	}
}

function get_methods() {
	ipcRenderer.send('methods-req');
}

function start() {
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