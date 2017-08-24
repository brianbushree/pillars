const electron = require('electron')
const dialog = electron.dialog

const fs = require('fs')
const path = require('path')
const url = require('url')
const exec = require('child_process').exec

const javapParser = require('./javap-parser/Javap-Parser.js')

function loadProject() {
  printMethods()
}

function printMethods() {

  /* ask user for directory */
  let dir = dialog.showOpenDialog({
      properties: [ 'openDirectory' ] })

  if (dir.length > 0) {
    javapParser.parse(dir)
  }
}

module.exports.loadProject = loadProject