/**
*
*  Vis-Builder
*
*     This builds data to input to the visualization. 
*/
const async = require('async');

function buildVisData(project, root) {

  let vis_data = {};
  vis_data['map'] = buildDataMap(project);
  vis_data['data'] = buildHierarchyData(project, vis_data['map']);
  vis_data['root'] = root;
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

  // check all callees
  async.each(project.data, function(c, callback) {
    async.each(c.methods, function(m, cb) {

      data_map[m.sig].callees.forEach(function(e) {

        if (!data_map[e]) {

          data_map[e] = {};
          let t = e.split('(')[0];
          data_map[e].parent = t.substring(0, t.lastIndexOf('.'));
          data_map[e].callees = [];

        }

      });

      cb();

    });
    callback();
  });

  return data_map;

}

function buildHierarchyData(project, data_map) {

  let data = [ { 'id': '0', 'sig': null } ];
  let node = 1;

  // connect from root to each method
  async.each(project.data, function(c, callback) {
    async.each(c.methods, function(m, cb) {

      node = buildMethod(data, data_map, m.sig, node, '0');
      cb();

    });
    callback();
  });

  console.log(data);

  return data;

}

function buildMethod(csv_data, data_map, sig, node, prefix) {

  prefix += '.' + (node++);
  csv_data.push({ 'id': prefix, 'sig': sig });

  if (!data_map[sig]) {

    console.log("ERROR: no method-entry; " + sig);

  } else {

    data_map[sig].callees.forEach(function(e, i) {

      if (reursionCheck(data_map, [], e)) {

        console.log("Recursion!!! : " + e);

      } else {

        node = buildMethod(csv_data, data_map, e, node, prefix);

      }

    });

  }

  return node;
}

function reursionCheck(data_map, trace, check) {

  if (trace.includes(check)) {

    return true;

  } else {

    trace.push(check);

    if (data_map[check]) {
      for (let i = 0; i < data_map[check].callees.length; i++) {
        if (reursionCheck(data_map, trace.slice(), data_map[check].callees[i])) {
          return true;
        }
      }
    } else {

      console.log("ERROR: no method-entry; " + check);

    }

  }

  return false;
}