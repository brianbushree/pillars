/**
 *
 *  Vis-Builder.js
 *
 *     This builds/filters vis-data to input 
 *      to the visualization. 
 */
const fs = require('fs');
const methodCleaner = require('./MethodCleaner.js')

/**
 * Given a built project, build & return visualization data.
 *
 * @param {Object} project  built project
 */
exports.buildVisData = function buildVisData(project) {

  methodCleaner.cleanMethodSignatures(project.exec_data);

  let vis_data = {};
  vis_data['mthd_map'] = buildDataMap(project);
  vis_data['class_map'] = buildClassMap(project);
  vis_data['data'] = buildHierarchyData(project);

  return vis_data;

}

/**
 * Given a built project, make class-data class map.
 *
 * @param {Object} project  built project
 * @return {Object} class_map  Map<name, data>
 */
function buildClassMap(project) {

  let class_map = {};

  // add class data to map (and read source files)
  project.class_data.forEach(function(cls) {
    class_map[cls.name] = cls;
    class_map[cls.name].src_content = fs.readFileSync(cls.src, 'utf8');
  });

  return class_map;
}

/**
 * Given a built project, make class-data method map.
 *
 * @param {Object} project  built project
 * @return {Object} mthd_map  Map<sig, data>
 */
function buildDataMap(project) {

  let mthd_map = {};

  // add javap data to map
  project.class_data.forEach(function(cls) {
    cls.methods.forEach(function (mthd) {
      mthd_map[mthd.sig] = mthd;
    });
  });

  // add all calls
  addToMap(mthd_map, project.exec_data);

  return mthd_map;

}

/**
 * Check all calls for missing entry
 *  in mthd_map. Add default if necessary.
 *
 * @param {Object} mthd_map  Map<sig, data> to add to
 * @param {Object} elem  method Object
 */
function addToMap(mthd_map, elem) {

  if (!mthd_map[elem.signature]) {

    mthd_map[elem.signature] = {};
    let t = elem.signature.split('(')[0];
    mthd_map[elem.signature].parent = t.substring(0, t.lastIndexOf('.'));

  }

  elem.calls.forEach(function(e, i) {
    addToMap(mthd_map, e);
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

  node = buildMethod(data, project.exec_data, node, '', true, project.exec_data.caller);
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
  node_data.push({ 'id': prefix, 'sig': elem.signature, 'time': +elem.duration.toString(),
                 'new_thread': new_thread , 'call': { 'line' : ((elem.caller != null) ? elem.caller.linenum : null) }, 'agg': elem.agg });


  let out = [];
  let temp = [];

  let aggGroup = 0;
  let agglist;

  elem.calls.forEach(function(call, i) {

    if (call.type == 1) {  // 1 == MethodCallType.THREAD_START

      // We want to see all created threads
      out.push(call);

    } else {

      // avoid looped calls!
      if (!includesSig(out, call.signature)) {

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
              e.agg = { 'group': aggGroup, times: [ e.time ]};
            }
            e.agg.times.push(temp[i].time);

          });

          temp.length = 0;

        }

      }
    }

  });

  out.forEach(function (call, i) {
    if (call.type == 1) {  // 1 == MethodCallType.THREAD_START
      // We want to see all created threads
      node = buildMethod(node_data, call.calls[0], node, prefix, true, call.call);
    } else {

      // aggregate into call.time
      if (call.agg) {
        let sum = 0;
        call.agg.times.forEach(function(t) {
          sum += t;
        });
        call.time = sum;
      }
    
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
    if (arr[i].signature == sig) {
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

    for (let i = 0; i < elem.calls.length; i++) {
      if (reursionCheck(trace.slice(), elem.calls[i])) {
        return true;
      }
    }

  }

  return false;
}