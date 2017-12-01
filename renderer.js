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
	}, 1000);
}

ipcRenderer.on('classes-res', function(e, classes) {
	add_classes(classes);
});

function add_classes(classes) {
	let cont = document.getElementById('classes');
	let celem;
	let melem;
	let a;

	classes.forEach(function(c, i) {

		celem = document.createElement('p');
		celem.setAttribute('class', 'class');

		celem.appendChild(document.createTextNode(c.name + ' '));
		a = document.createElement('a');
		a.appendChild(document.createTextNode('select'));
		a.setAttribute('href', '#');
		a.setAttribute('onclick', 'select_root(this);  return false;');

		celem.appendChild(a);
		cont.appendChild(celem);

		c.sigs.forEach(function(m, i) {

			elem = document.createElement('p');
			elem.setAttribute('class', 'method');
			elem.setAttribute('style', 'text-indent: 35px;');
			elem.appendChild(document.createTextNode(m + ' '));
			a = document.createElement('a');
			a.appendChild(document.createTextNode('select'));
			a.setAttribute('href', '#');
			a.setAttribute('onclick', 'select_root(this);  return false;');

			elem.appendChild(a);
			cont.appendChild(elem);

		});

	});

}

function select_root(link) {
	let parent = link.parentNode;
	let cls;
	deselect_all_roots(parent);
	add_class(parent, 'selected');
}

function deselect_all_roots(parent) {

	let all = document.querySelectorAll('.selected');

	for (let e of all) {
		remove_class(e, 'selected');
	}

}

function has_class(e, name) {
	let cls = e.getAttribute('class').split(' ');
	return cls.includes(name);
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

function submit_root() {

	let sel = document.querySelector('.selected');
	let send = { type: '', value: ''};

	if (sel) {
		if (has_class(sel, 'class')) {
			send.type = 'class';
		} else {
			send.type = 'method';
		}
		send.value = sel.textContent.substring(0, sel.textContent.lastIndexOf(' '));

		ipcRenderer.send('root-select', send);
	} else {
		alert('no root selected - showing all');
		ipcRenderer.send('root-select', null);
	}
}

function get_classes() {
	ipcRenderer.send('classes-req');
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