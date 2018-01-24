const {ipcRenderer} = require('electron');

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