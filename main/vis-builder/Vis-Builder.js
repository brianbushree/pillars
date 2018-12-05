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

  node = buildMethod(data, project.exec_data, node, '');
  return data;

}

/**
 * Given a built project, return execution data
 *  while avoiding (and aggregating) repeated sets
 *  of method calls (mostly loops).
 *
 * @param {Array<Object>} node_list  list of nodes to add to
 * @param {Object} elem  method call Object
 * @param {number} node  unique node value
 * @param {string} prefix  this node's parent
 * @param {boolean} new_thread  true if this method was called by Thread.start()
 * @param {Object} caller_info  Object containing file & line of caller
 * @return {Object} built method call Object
 */
function buildMethod(node_list, elem, node, prefix) {
  prefix += ((node != 0) ? '.' : '') + (node++);
  node_list.push({ 'id': prefix, 'sig': elem.signature,
                 'time': ((elem.duration != undefined) ? +elem.duration : undefined ),
                 'newThread': elem.type == "THREAD_START",
                 'agg': elem.agg,
                 'call': {
                    'line' : ((elem.caller != null) ? elem.caller.linenum : null)
                  },
                 'instructions': elem.instructions,
                 'params': elem.paramValues,
                 'returnValue': elem.returnValue 
                });

  aggRepeatCalls(elem.calls).forEach(function (call, i) {

    // sum durations
    if (call.agg) {
      let sum = 0;
      call.agg.calls.forEach(function(t) {
        sum += +t.duration;
      });
      call.duration = sum;
    }
    
    node = buildMethod(node_list, call, node, prefix);

  });
  return node;
}

/**
 * Aggregate repeated method calls into a single object.
 * @param {Array<Object>} list of method calls
 * @return aggreagated list of calls
 */
function aggRepeatCalls(calls) {
  let out = [];
  let check = [];

  let aggGroup = 0;
  let agglist;

  let emptyCheckList = function() {
    if (check.length != 0) {
      check.forEach(function(c) {
        out.push(c);
      });
      check.length = 0;
    }
  };

  calls.forEach(function(call, i) {
    if (call.type == "THREAD_START" || !includesSig(out, call.signature)) {

      emptyCheckList();
      out.push(call);

    } else {
      check.push(call);

      if (arrayEquals(check, out.slice(out.length - check.length, out.length))) {
        aggGroup++;
        agglist = out.slice(out.length - check.length, out.length);

        let copy = function(o) {
          return JSON.parse(JSON.stringify(o));
        };

        agglist.forEach(function(e, i) {

          if (e.agg == null) {
            e.agg = { 'group': aggGroup, calls: [ copy(e) ]};
          }
          e.agg.calls.push(copy(check[i]));

        });

        check.length = 0;
      }
    }
  });
  emptyCheckList();
  return out;
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
      if (a[i].signature != b[i].signature) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}
