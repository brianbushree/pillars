/**
*  Javap-Parser.js
*     
*     parse a directory of '.class' files
*       using 'javap' into JSON format
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
 *  @param {function} callback(err, data)
 */
function parseAsync(dirs, callback) {

  let classes = [];
  let pending;
  let f;
  let a;

  dirs.forEach(function(dir, i) {

    fs.readdir(dir, function(err, files) {
      if (err) return callback(err);

      pending = files.length;
      if (!pending) return callback(null, classes);

      async.each(files, function(file, cb) {

        f = path.join(dir, file);

        if (fs.lstatSync(f).isDirectory()) {

          a = [];
          a.push(f);

          parseAsync(a, function(err, res) {
            classes = classes.concat(res);
            if (!--pending) {
              classes = compressSubclasses(classes);
              callback(null, classes); 
            }
            cb();
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
          cb();
        }

      });

    });

  });

}
module.exports.parseAsync = parseAsync;

/**
 * Make class objects from a '.class' file.
 *
 *  @param {String} file 
 *  @return {Object} class object
 */
function makeClass(file) {

  const fileRegex = /^Compiled from \"(.*)\"$/gm;
  const classRegex = /(?:(public|private)\s)?(?:(abstract)\s)?(?:(final)\s)?(?:(strictfp)\s)?(class|interface)\s(\S+(?:<.*?>)?)\s(?:extends\s(.*?)\s)?(?:implements\s(.*?)\s)?{$/gm;
  const methodRegex = /(?:^\s*)(?:(public|protected|private)\s)?(?:(abstract)\s)?(?:(static)\s)?(?:(final)\s)?(?:(native)\s)?(?:(strictfp)\s)?(?:(synchronized)\s)?(?:(\S+(?:\[\])?)\s)?(\w+)\((.*)\).*;$/gm;

  let c = {};
  let classAttrs;
  let m = null;
  let method;
  let stdout = execSync('javap -p \'' + file + '\'').toString();

  c.file = file;
  c.filebase = path.basename(file); 
  c.src = fileRegex.exec(stdout)[1];
  c.name = "";
  c.package = "";
  c.attributes = {};
  c.methods = [];
  c.subclasses = [];

  classAttrs = classRegex.exec(stdout); 
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
  c.name = classAttrs[6].replace(/<.*>/g, '');
  c.package = c.name.substring(0, c.name.lastIndexOf('.'));

  while ( ( m = methodRegex.exec(stdout)) !== null ) {
    method = {};
    method.sig = '';
    method.name = m[9];
    method.returnType = m[8] ? m[8] : "(constructor)";
    method.args = m[10] ? m[10].split(/, /g) : [];
    method.callees = [];

    method.sig = c.name + '.' + method.name + '(';
    method.args.forEach(function(arg, i) {
      method.sig += arg + ((i < method.args.length - 1) ? ', ' : '');
    });
    method.sig += ')';
    method.sig = method.sig.replace(/<.*>/g, '');

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
 * Move subclasses inside classes.
 *
 *  @param {class obj[]} classes 
 *  @return {class obj[]} classes 
 */
function compressSubclasses(classes) {

  let newClasses = [];

  classes.forEach(function(c, i) {
    if (!c.filebase.includes('$')) {
      classes.forEach(function(d,j) {
        if (i == j) return;

        if (d.filebase.includes(c.filebase.substring(0, c.filebase.lastIndexOf(".")) + '$')) {
          c.subclasses.push(d);
        }
      });
      newClasses.push(c);
    }
  });

  return newClasses;
}