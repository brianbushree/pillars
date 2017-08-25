const fs = require('fs')
const path = require('path')
const url = require('url')
const execSync = require('child_process').execSync

function parse(dir) {

  classes = []

  dir.forEach(function(d) {
    fs.readdir(d, (err, files) => {
      files.forEach(file => {

        if (file.split('.').pop().toLowerCase() === 'class') {

          let f = (d + '/' + file).replace(/ /g, '\\ ')
          classes.push(makeClass(f))

        }

      })
      // console.log(classes)
    })
  })

}

module.exports.parse = parse

function makeClass(file) {

  const classNameRegex = /^Compiled from \"(.*)\"$/gm
  const methodRegex = /(?:^\s*)(?:(public|protected|private)\s)?(?:(abstract)\s)?(?:(static)\s)?(?:(final)\s)?(?:(native)\s)?(?:(strictfp)\s)?(?:(synchronized)\s)?(?:(\w+(?:\[\])?)\s)?(\w+)\((.*)\).*;$/gm

  let c = {}

  let stdout = execSync('javap -p ' + file).toString()

  c.name = classNameRegex.exec(stdout)[1]
  c.methods = []

  let m = undefined
  while ( ( m = methodRegex.exec(stdout)) !== null ) {
    let method = {}

    method.visibility = m[1]
    method.abstract = m[2] ? true : false
    method.static = m[3] ? true : false
    method.final = m[4] ? true : false
    method.native = m[5] ? true : false
    method.strictfp = m[6] ? true : false
    method.synchronized = m[7] ? true : false
    method.returnType = m[8]
    method.name = m[9]
    method.args = m[10] ? m[10].split(/, /g) : []
    method.callees = []

    c.methods.push(method)
  }

  return c
}