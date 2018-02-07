/**
 *
 *  Vis-Builder.js
 *
 *     This builds/filters vis-data to input 
 *      to the visualization. 
 */

/**
 * Given a built project, build & return visualization data.
 *
 * @param {Object} project  built project
 */
exports.buildVisData = function buildVisData(project) {

  let vis_data = {};
  vis_data['map'] = buildDataMap(project);
  vis_data['data'] = buildHierarchyData(project);

  return vis_data;

}

/**
 * Given a built project, make class-data map.
 *
 * @param {Object} project  built project
 * @return {Object} data_map  Map<sig, data>
 */
function buildDataMap(project) {

  let data_map = {};

  // add javap data to map
  project.class_data.forEach(function(cls) {
    cls.methods.forEach(function (mthd) {
      data_map[mthd.sig] = mthd;
    });
  });

  // add all callees
  addToMap(data_map, project.exec_data[0]);

  return data_map;

}

/**
 * Check all callees for missing entry
 *  in data_map. Add default if necessary.
 *
 * @param {Object} data_map  Map<sig, data> to add to
 * @param {Object} elem  method Object
 */
function addToMap(data_map, elem) {

  if (!data_map[elem.sig]) {

    data_map[elem.sig] = {};
    let t = elem.sig.split('(')[0];
    data_map[elem.sig].parent = t.substring(0, t.lastIndexOf('.'));

  }

  elem.callees.forEach(function(e, i) {
    addToMap(data_map, e);
  });

}

/**
 * Given a built project, return execution data.
 *
 * @param {Object} project
 * @return {Object} data  method data
 */
function buildHierarchyData(project) {

  let data = [];
  let node = 0;


  node = buildMethod(data, project.exec_data[0], node, '', true, project.exec_data[0].call);
  return data;

}

// TODO add recursion check

/**
 * Given a built project, return execution data
 *  while avoiding (and aggregating) repeated sets
 *  of method calls (mostly loops).
 *
 * @param {Array<Object>} node_data  list of nodes to add to
 * @param {Object} elem  method call Object
 * @param {number} node  unique node value
 * @param {string} prefix  this node's parent
 * @param {boolean} new_thread  true if this method was called by Thread.start()
 * @param {Object} caller_info  Object containing file & line of caller
 */
function buildMethod(node_data, elem, node, prefix, new_thread, caller_info) {

  prefix += ((node != 0) ? '.' : '') + (node++);
  node_data.push({ 'id': prefix, 'sig': elem.sig, 'time': elem.time, 'new_thread': new_thread , 'call': caller_info, 'agg': elem.agg });


  let out = [];
  let temp = [];

  let aggGroup = 0;
  let agglist;

  elem.callees.forEach(function(call, i) {

    if (call.sig == 'Thread.start()') {

      // We want to see all created threads
      out.push(call);

    } else {

      // avoid looped calls!
      if (!includesSig(out, call.sig)) {

        if (temp.length != 0) {
          temp.forEach(function(c) {
            out.push(c);
          });
          temp.length = 0;
        }

        out.push(call);

      } else {

        temp.push(call);

        if (arrayEquals(temp, out.slice(out.length - temp.length, out.length))) {

          aggGroup++;
          agglist = out.slice(out.length - temp.length, out.length);

          agglist.forEach(function(e, i) {

            if (e.agg == null) {
              e.agg = { 'group': aggGroup, times: []};
            }
            e.agg.times.push(temp[i].time);

          });

          temp.length = 0;

        }

      }
    }

  });

  out.forEach(function (call, i) {
    if (call.sig == 'Thread.start()') {
      // We want to see all created threads
      node = buildMethod(node_data, call.callees[0], node, prefix, true, call.call);
    } else {
      node = buildMethod(node_data, call, node, prefix, false, call.call);
    }
  });

  return node;
}

/**
 * Test if array of method calls contains signature.
 *
 * @param {Array<Object>} arr  array of method calls
 * @param {string} sig  signature to test
 * @return {boolean} true if included, false otherwise
 */
function includesSig(arr, sig) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].sig == sig) {
      return true;
    }
  }
  return false;
}

/**
 * Test if two arrays of method calls are equal.
 *
 * @param {Array<Object>} a  array of method calls
 * @param {Array<Object>} b  array of method calls
 * @return {boolean} true if equal, false otherwise
 */
function arrayEquals(a, b) {
  if (a.length == b.length) {
    for (let i = 0; i < a.length; i++) {
      if (a[i].sig != b[i].sig) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}

/**
 * Test if a given method directly or indirectly 
 *  calls itself. (Except 'Thread.start()')
 *
 * @param {Array<string>} trace  list of all method calls
 * @param {Object} elem  method call Object
 * @return {boolean} true if recursive, false otherwise
 */
function reursionCheck(trace, elem) {

  // We want to see all created threads
  if (elem.sig == 'Thread.start()') {
    return false;
  } 

  if (trace.includes(elem.sig)) {

    return true;

  } else {

    trace.push(elem.sig);

    for (let i = 0; i < elem.callees.length; i++) {
      if (reursionCheck(trace.slice(), elem.callees[i])) {
        return true;
      }
    }

  }

  return false;
}