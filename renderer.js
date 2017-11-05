const {ipcRenderer} = require('electron');

function start() {
	ipcRenderer.send('load-project');
}