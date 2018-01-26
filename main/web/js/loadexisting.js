const {ipcRenderer} = require('electron');

function back() {
	ipcRenderer.send('start');
}

let nameList = [];

ipcRenderer.send('proj_stor_req');

ipcRenderer.on('proj_stor_res', function(event, names) {

	add_to_container('projects', names, 0);
	nameList = names;

})

function add_to_container(parentID, data, offset) {
	let parent = document.getElementById(parentID);

	data.forEach(function(e, i) {

		elem = document.createElement('p');
		elem.setAttribute('class', 'project');
		elem.setAttribute('name', e);
		elem.appendChild(document.createTextNode(e + " "));

		a = document.createElement('a');
		a.appendChild(document.createTextNode('select'));
		a.setAttribute('href', '#');
		a.setAttribute('onclick', 'select_from_list(this); return false;');
		elem.appendChild(a);

		elem.appendChild(document.createTextNode(" "));

		a = document.createElement('a');
		a.appendChild(document.createTextNode('delete'));
		a.setAttribute('href', '#');
		a.setAttribute('onclick', 'delete_file(this, ' + (offset + i) + '); return false;');
		elem.appendChild(a);



		elem.appendChild(a);
		parent.appendChild(elem);

	});

}

function delete_file(child, index) {
	if (confirm('Are you sure you want to delete this saved project?')) {
		ipcRenderer.send('proj_del', child.parentNode.getAttribute('name'));
		remove_file_from_list(child, index);
	}
}

function remove_all_from_node(parent) {
	while(parent.firstChild) {
	    parent.removeChild(parent.firstChild);
	}
}

function remove_file_from_list(child, index) {

	nameList.splice(index, 1);
	remove_all_from_node(child.parentNode.parentNode);
	add_to_container('projects', nameList, 0);

}

function select_from_list(elem) {
	deselect_all();
	add_class(elem.parentNode, 'selected');
}

function deselect_all(parent) {

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

function select() {

	let sel = document.querySelector('.selected');

	if (sel) {
		ipcRenderer.send('proj_stor_select', sel.getAttribute('name'));
	} else {
		alert('Select a project to continue!');
	}
}

