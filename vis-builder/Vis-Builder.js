/**
*
*  Vis-Builder
*
*
*/
const async = require('async');

function buildVisData(project) {

  let vis_data = null;
  buildDataMap(project);

  return vis_data;

}
module.exports.buildVisData = buildVisData;

function buildDataMap(project) {

  let data_map = {};

  async.each(project.data, function(c, callback) {
    async.each(c.methods, function(m, cb) {

      data_map[m.sig] = m;

    });
  });

  return data_map;

}

function buildHierarchyData(project) {

  let node = 0;
  let csv_data = [ "id,ref", "0,null" ];

  // connect from root to each method
  async.each(project.data, function(c, callback) {
    async.each(c.methods, function(m, cb) {



    });
  });

  // connect each method to it's callees
  // Note: watch for infinite recursion!!


}