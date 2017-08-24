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
      console.log(classes)
    })
  })

}

module.exports.parse = parse

function makeClass(file) {

  let c = undefined
  let stdout = execSync('javap -p ' + file).toString()


  /* extract/create each method
      
    c.class_name = "Class"
    c.methods = []

    let method = 
      {
        'name' : 'testMethod',
        'static' : false/true,
        'final' : false/true,
        'arg_types': ['int', 'String', ... ],
        'callees': [ 'TestClass.run', 'TestClass2.test', ... ]
      }
    
    // Add to class
    c.methods.push(method)
  */

  c = { 'test': stdout }


  /* return our JSON Class object */
  return c
}