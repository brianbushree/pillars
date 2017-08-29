const fs = require('fs');
const path = require('path');
const url = require('url');
const execSync = require('child_process').execSync;

function parseAsync(dir, callback) {

  let classes = []

  fs.readdir(dir, (err, files) => {

    if (err) return callback(err);

    let pending = files.length;
    if (!pending) return callback(null, classes);

    files.forEach(function(file) {

      let f = path.join(dir, file);

      if (fs.lstatSync(f).isDirectory()) {
        parseAsync(f, function(err, res) {
          classes.concat(res);
          if (!--pending) callback(null, classes);
        });
      }
      else {
        if (path.extname(f).toLowerCase() === '.class') {
          classes.push(makeClass(f));
        }
        if (!--pending) callback(null, classes);
      }

    })

  })

}

module.exports.parseAsync = parseAsync;

function makeClass(file) {

  const fileRegex = /^Compiled from \"(.*)\"$/gm;
  const methodRegex = /(?:^\s*)(?:(public|protected|private)\s)?(?:(abstract)\s)?(?:(static)\s)?(?:(final)\s)?(?:(native)\s)?(?:(strictfp)\s)?(?:(synchronized)\s)?(?:(\w+(?:\[\])?)\s)?(\w+)\((.*)\).*;$/gm;

  let stdout = execSync('javap -p ' + file).toString();

  let c = {};
  c.name = path.basename(file).split('.')[0]
  c.file = fileRegex.exec(stdout)[1];
  c.methods = [];

  let m = undefined;
  while ( ( m = methodRegex.exec(stdout)) !== null ) {
    let method = {};

    method.name = m[9];
    method.returnType = m[8] ? m[8] : "(constructor)";
    method.args = m[10] ? m[10].split(/, /g) : [];
    method.callees = [];

    method.attributes = {};
    method.attributes.visibility = m[1];
    method.attributes.abstract = m[2] ? true : false;
    method.attributes.static = m[3] ? true : false;
    method.attributes.final = m[4] ? true : false;
    method.attributes.native = m[5] ? true : false;
    method.attributes.strictfp = m[6] ? true : false;
    method.attributes.synchronized = m[7] ? true : false;

    c.methods.push(method);
  }

  return c;
}