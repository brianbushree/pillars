/**
*  Javap-Parser.js
*     
*     parse a directory of '.class' files
*       using 'javap' into JSON format
*
*/
const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const async = require('async');

/**
 * Parse a directory of '.class' files
 *  into JSON format from 'javap' output.
 *
 *  @param {String} directory 
 *  @param {function} callback
 */
function parseAsync(dir, callback) {

  let classes = [];

  fs.readdir(dir, function(err, files) {
    if (err) return callback(err);

    let pending = files.length;
    if (!pending) return callback(null, classes);

    async.each(files, function(file, cb) {

      let f = path.join(dir, file);

      if (fs.lstatSync(f).isDirectory()) {
        parseAsync(f, function(err, res) {
          classes.concat(res);
          if (!--pending) {
            classes = compressSubclasses(classes)
            callback(null, classes); 
          }
        });
      }
      else {
        if (path.extname(f).toLowerCase() === '.class') {
          classes.push(makeClass(f));
        }
        if (!--pending) {
          classes = compressSubclasses(classes);
          callback(null, classes); 
        }
      }

    })

  })

}
module.exports.parseAsync = parseAsync;

/**
 * Make class objects from a '.class' file.
 *
 *  @param {String} directory 
 *  @return {Object} class object
 */
function makeClass(file) {

  const fileRegex = /^Compiled from \"(.*)\"$/gm;
  const classRegex = /(?:^\s*)(?:(public|private)\s)?(?:(abstract)\s)?(?:(final)\s)?(?:(strictfp)\s)?(class|interface)\s(\S+)\s(?:extends\s(.+)\s)?(?:implements\s(.+)\s)?{$/gm;
  const methodRegex = /(?:^\s*)(?:(public|protected|private)\s)?(?:(abstract)\s)?(?:(static)\s)?(?:(final)\s)?(?:(native)\s)?(?:(strictfp)\s)?(?:(synchronized)\s)?(?:(\S+(?:\[\])?)\s)?(\w+)\((.*)\).*;$/gm;

  let stdout = execSync('javap -p \'' + file + '\'').toString();

  let c = {};

  c.file = file;
  c.filebase = path.basename(file); 
  c.src = fileRegex.exec(stdout)[1];
  c.name = "";
  c.package = "";

  c.attributes = {};
  c.methods = [];
  c.subclasses = [];

  let classAttrs = classRegex.exec(stdout); 
  if (classAttrs == null) {
    console.log(file);
  }
  c.attributes.visibility = classAttrs[1];
  c.attributes.abstract = classAttrs[2] ? true : false;
  c.attributes.final = classAttrs[3] ? true : false;
  c.attributes.strictfp = classAttrs[4] ? true : false;
  c.attributes.interface = classAttrs[5] == 'interface' ? true : false; 
  c.attributes.extends = classAttrs[7];
  c.attributes.implements = classAttrs[8];
  c.name = classAttrs[6];
  c.package = c.name.substring(0, c.name.lastIndexOf('.'));

  let m = undefined;
  while ( ( m = methodRegex.exec(stdout)) !== null ) {
    let method = {};

    method.sig = '';
    method.name = m[9];
    method.returnType = m[8] ? m[8] : "(constructor)";
    method.args = m[10] ? m[10].split(/, /g) : [];
    method.callees = [];

    method.sig = c.name + '.' + method.name + ((method.args.length > 0) ? '(' : '');
    method.args.forEach(function(arg,i) {
      method.sig += arg + ((i < method.args.length - 1) ? ', ' : '');
    });
    method.sig += ((method.args.length > 0) ? ')' : '');

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

/**
 * Move subclasses into classes.
 *
 *  @param {class array} classes 
 *  @return {class array} classes 
 */
function compressSubclasses(classes) {

  let newClasses = [];

  classes.forEach(function(e,i) {
    if (!e.filebase.includes('$')) {
      classes.forEach(function(d,j) {
        if (i == j) return;

        if (d.filebase.includes(e.filebase.substring(0, e.filebase.lastIndexOf(".")) + '$')) {
          e.subclasses.push(d);
        }
      });
      newClasses.push(e);
    }
  });

  return newClasses;
}