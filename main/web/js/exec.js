const {ipcRenderer} = require('electron');

setInterval(function() {
  exec_req();
}, 500);

function exec_req() {
  ipcRenderer.send('exec_req');
}

ipcRenderer.on('exec-res', function(e, out) {
  let term = document.getElementById('term-out');
  if (term.scrollTop + term.clientHeight == term.scrollHeight) {
    term.value = out;
    term.scrollTop = term.scrollHeight;
  } else {
    term.value = out;
  }
});

function exec_send() {

  let term_in = document.getElementById('term-in');

  if (term_in.value.endsWith('\n')) {
    ipcRenderer.send('exec_send', document.getElementById('term-in').value);
    term_in.value = "";
  } 
}