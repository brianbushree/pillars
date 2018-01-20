/**
*
*  Vis-Builder
*
*     This builds/filters data to input to the visualization. 
*/

function buildVisData(project, root) {

  let vis_data = {};
  vis_data['map'] = buildDataMap(project);
  vis_data['data'] = buildHierarchyData(project);
  vis_data['root'] = root;

  return vis_data;

}
module.exports.buildVisData = buildVisData;

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

function buildHierarchyData(project) {

  let data = [];
  let node = 0;


  node = buildMethod(data, project.exec_data[0], node, '');
  return data;

}

// TODO add recursion check
function buildMethod(csv_data, elem, node, prefix) {

  prefix += ((node != 0) ? '.' : '') + (node++);
  csv_data.push({ 'id': prefix, 'sig': elem.sig, 'time': elem.time });


  let out = [];
  let temp = [];
  elem.callees.forEach(function(call, i) {

    if (call.sig == 'Thread.start()') {

      // We want to see all created threads
      node = buildMethod(csv_data, call, node, prefix);

    } else {

      // avoid looped calls!
      if (!includesSig(out, call.sig)) {

        if (temp.length != 0) {
          temp.forEach(function(c) {
            out.push(c);
            node = buildMethod(csv_data, c, node, prefix);
          });
          temp.length = 0;
        }

        out.push(call);
        node = buildMethod(csv_data, call, node, prefix);

      } else {

        temp.push(call);

        if (arrayEquals(temp, out.slice(out.length - temp.length, out.length))) {

          //console.log('loop!', temp);
          temp.length = 0;

        }

      }
    }

  });

  return node;
}

function includesSig(arr, sig) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].sig == sig) {
      return true;
    }
  }
  return false;
}

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