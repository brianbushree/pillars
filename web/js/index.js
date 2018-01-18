const {ipcRenderer} = require('electron');

function start() {
	ipcRenderer.send('start');
}

function load_existing() {
	ipcRenderer.send('load_existing');
}

function load_new() {
	ipcRenderer.send('load_new');
}