const {ipcRenderer} = require('electron');

function start() {
	ipcRenderer.send('start');
}

let project = {
	'name' : null,
	'class_dirs' : [],
	'src_dirs' : [],
	'classpath': [],
	'jar': null,
	'runargs': [],
	'packages': []
};
let loading = null;

function make_project(project) {
	let name = document.getElementById('name').value;
	if (name.length && project.class_dirs.length && project.src_dirs.length && project.jar && project.packages.length) {
		alert("run!");
		project.name = name;
		ipcRenderer.send('load_project', project, true);
		start_loading();
	}
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

function jar_prompt() {
	ipcRenderer.send('jar_prompt');
}

function runarg_enter() {
	let p = document.getElementById('runarg');

	if (p.value != '') {
		add_files_to_elem('proj-runargs', [p.value], project.runargs.length);

		project.runargs.push(p.value);
		p.value = '';
	}
}

function package_enter() {
	let p = document.getElementById('package');

	if (p.value != '') {
		add_files_to_elem('proj-packages', [p.value], project.packages.length);

		project.packages.push(p.value);
		p.value = '';
	}
}

ipcRenderer.on('class_res', function(e, data) {
	if (!data) { return }
	add_files_to_elem('proj-classes', data, project.class_dirs.length);
	project.class_dirs = project.class_dirs.concat(data);
});

ipcRenderer.on('src_res', function(e, data) {
	if (!data) { return }
	add_files_to_elem('proj-src', data, project.src_dirs.length);
	project.src_dirs = project.src_dirs.concat(data);
});

ipcRenderer.on('classpath_res', function(e, data) {
	if (!data) { return }
	add_files_to_elem('proj-classpath', data, project.classpath.length);
	project.classpath = project.classpath.concat(data);
});

ipcRenderer.on('jar_res', function(e, data) {
	if (!data) { return }
	if (project.jar != null) {
		alert('Only one jar can be selected.');
		return;
	}
	add_files_to_elem('proj-jar', data, 0);
	project.jar = data[0];
});

function add_files_to_elem(parentID, data, offset) {

	let elem;
	let a;

	if (!data) {
		return;
	}

	data.forEach(function(e, i) {
		if (e != null) {
			elem = document.createElement('p');
			a = document.createElement('a');
			a.appendChild(document.createTextNode('remove'));
			a.setAttribute('href', '#');
			a.setAttribute('onclick', 'remove_file_from_list(this, ' + (offset + i) + '); return false;');
			elem.appendChild(document.createTextNode(e + " "));
			elem.appendChild(a);
			document.getElementById(parentID).appendChild(elem);
		}
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
		arr = project.src_dirs;
	} else if (parent.getAttribute('id') == 'proj-classpath') {
		arr = project.classpath;
	} else if (parent.getAttribute('id') == 'proj-jar') {
		project.jar = null;
		remove_all_from_node(parent);
		return;
	} else if (parent.getAttribute('id') == 'proj-packages') {
		arr = project.packages;
	} else if (parent.getAttribute('id') == 'proj-runargs') {
		arr = project.packages;
	}

	cpy = arr.slice();
	cpy.splice(index, 1);

	arr.splice(0, arr.length);
	remove_all_from_node(parent);
	add_files_to_elem(parent.getAttribute('id'), cpy, 0);

	if (parent.getAttribute('id') == 'proj-classes') {
		project.class_dirs = cpy;
	} else if (parent.getAttribute('id') == 'proj-src') {
		project.src_dirs = cpy;
	} else if (parent.getAttribute('id') == 'proj-classpath') {
		project.classpath = cpy;
	} else if (parent.getAttribute('id') == 'proj-packages') {
		project.packages = cpy;
	} else if (parent.getAttribute('id') == 'proj-runargs') {
		project.runargs = cpy;
	}

}