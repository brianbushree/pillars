/**
*
*  Vis-Builder
*
*     This builds data to input to the visualization. 
*/
const async = require('async');

function buildVisData(project) {

  let vis_data = {};
  vis_data['map'] = buildDataMap(project);
  vis_data['data'] = buildHierarchyData(project, map);
  console.log(vis_data['data']);

  return vis_data;

}
module.exports.buildVisData = buildVisData;

function buildDataMap(project) {

  let data_map = {};

  async.each(project.data, function(c, callback) {
    async.each(c.methods, function(m, cb) {

      data_map[m.sig] = m;
      cb();

    });
    callback();
  });

  return data_map;

}

function buildHierarchyData(project, data_map) {

  let csv_data = [ 'id,ref', '0,null' ];
  let node = 1;

  // connect from root to each method
  async.each(project.data, function(c, callback) {
    async.each(c.methods, function(m, cb) {

      node = buildMethod(csv_data, data_map, m.sig, node, '0');
      cb();

    });
    callback();
  });

  console.log(csv_data);

  return csv_data;

}

function buildMethod(csv_data, data_map, sig, node, prefix) {

  prefix += '.' + (node++);
  csv_data.push(prefix + ',"' + sig + '"');

  if (!data_map[sig]) {

    console.log("ERROR: no method-entry; " + sig);

  } else {

    data_map[sig].callees.forEach(function(e, i) {

      if (e == sig) {

        // Recursion! - TODO

      } else {

        node = buildMethod(csv_data, data_map, e, node, prefix);

      }

    });

  }

  return node;
}