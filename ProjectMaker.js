const electron = require('electron')
const dialog = electron.dialog

const fs = require('fs')
const path = require('path')
const url = require('url')
const exec = require('child_process').exec

function loadProject() {
  printMethods()
}

function printMethods() {

  /* ask user for directory */
  let dir = dialog.showOpenDialog({
      properties: [ 'openDirectory' ] })

  if (dir.length > 0) {

    dir.forEach(function(d) {
      fs.readdir(d, (err, files) => {
        files.forEach(file => {

          if (file.split('.').pop() == 'class') {
            let f = (d + '/' + file).replace(/ /g, '\\ ')
            exec('javap -p ' + f,
              function (error, stdout, stderr){
                console.log('Output -> ' + stdout);
                if(error !== null){
                  console.log("Error -> "+error);
                }
              }
            )
          }

        })
      })
    })

  }
}

module.exports.loadProject = loadProject