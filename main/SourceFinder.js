/**
 *  SourceFinder.js
 *     
 *     This is used to find all '.java' files inside a src dir
 *      and assign them to the class data.
 */
const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

exports.addSrcFiles = function addSrcFiles(project, callback) {

    parseSrcDirs("", project.src_dirs, function(err, classMap) {

        if (err) {  callback(err);  }

        // assign src files to classes
        project.class_data.forEach(function(cl, i) {

            // trim anonymous class names
            let name = cl.name.substring(0, (cl.name.includes('$')) ? cl.name.indexOf('$') : cl.name.length);

            if (classMap[name]) {
                cl.src = classMap[name];
            } else {
                console.log('ERROR: cannot find src :' + name);
            }

        });

        callback(null);

    });

}

function parseSrcDirs(prefix, dirs, callback) {

    let classMap = {};

    let pending;

    let full_path;
    let base;

    let pre;
    let className;

    dirs.forEach(function(dir, i) {

        // read dir
        fs.readdir(dir, function(err, files) {
            if (err) return callback(err);

            // set pending var
            pending = files.length;
            if (!pending) return callback(null, classes);

            files.forEach(function(file) {

                full_path = path.join(dir, file);
                let base = path.basename(full_path);

                if (fs.lstatSync(full_path).isDirectory()) {

                    pre = prefix;

                    // add dir name as prefix (avoid immediate dirs)
                    if (!pre.length && base != 'java' && base != 'main') {
                        pre += base + '.';
                    }

                    // recur
                    parseSrcDirs(pre, [ full_path ], function(err, res) {

                        Object.keys(res).forEach(function(e, i) {

                            if (!classMap[e]) {
                                classMap[e] = res[e];
                            }

                        });

                        if (!--pending) {
                          callback(null, classMap); 
                        }

                    });

                } else {

                    if (path.extname(full_path).toLowerCase() === '.java') {
                        
                        className = prefix + base.substring(0, base.lastIndexOf('.'));
                        
                        if (!classMap[className]) {
                            classMap[className] = full_path;
                        }

                    }

                    if (!--pending) {
                        callback(null, classMap); 
                    }
                  
                }
          });
        });

    });

}
