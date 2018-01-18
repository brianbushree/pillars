const {ipcRenderer} = require('electron');

var visData = null;

// request data from main process
ipcRenderer.send('data-req');
ipcRenderer.on('data-res', function (event, data) {
  visData = data;
  render(data);
});

// select a new root
function newRoot() {
  ipcRenderer.send('new_root');
}

// configure size, margin, and circle radius
var config = {
    w: 1025,
    h: 750,
    r: 4,
    tpad: 50,
    lpad: 300,
    bpad: 50,
    rpad: 20
};

// maximum diameter of circle is minimum dimension
config.d = Math.min(config.w, config.h);

var svg = d3.select("body").select("svg");

// dynamic globals
var hor = false;
var parents = [];
var currentRoot = null;

// setup scales
var scales = {};
scales.color = {};
scales.color.class = d3.scaleOrdinal(d3.schemeCategory20c);

// accessor functions for x and y
var x = function(d) { return d.x; };
var y = function(d) { return d.y; };

function render(data) {
  // convert
  data.data.forEach(function(e, i) {
    e.name = e.id;
    e = convert(e);
  });

  callback(null, visData.data); 
}

function horToggle() {
  hor = !hor;
  drawFromRoot(currentRoot);
}

function convert(row) {
  row.id = row.name;
  var parts = row.name.split(".")
  row.name = parts[parts.length - 1];
  return row;
}

function selectRoot(root, sel) {

  if (!sel) {
    return root;
  }

  if (sel.type == 'class') {

    let newChildren = [];
    let newHeight = 0;

    // filter by class & set new height
    for (let i = 0; i < root.children.length; i++) {
      if (visData.map[root.children[i].data.sig] &&visData.map[root.children[i].data.sig].parent == sel.value) {
        newChildren.push(root.children[i]);

        if (newHeight < root.children[i].height) {
          newHeight = root.children[i].height;
        }
      }
    }

    root.children = newChildren;
    root.height = newHeight;

  } else {

    // find method by sig
    for (let i = 0; i < root.children.length; i++) {
      if (root.children[i].data.sig == sel.value) {
        root = root.children[i];
        break;
      }
    }

  }

  return root;
}

function callback(error, data) {
    if (error) {
        console.warn(file, error);
        return;
    }

    console.log("data:", data.length, data);

    // create hierarchy
    var stratify = d3.stratify()
      .id(function(d) { return d.id; })
      .parentId(function(d) {
        return d.id.substring(0, d.id.lastIndexOf("."));
      });

    // convert csv into hierarchy
    var realroot = stratify(data);
    var root = selectRoot(realroot.copy(), visData.root);
    console.log("realroot:", realroot);
    console.log("root", root);

    svg.attr("width", config.w);
    svg.attr("height", config.h);

    var g = svg.append("g");
    g.attr("id", "plot");
    g.attr("transform", translate(config.lpad, config.tpad));

    var leg = svg.append("g");
    leg.attr("id", "legend");
    leg.attr("transform", translate(0, 50));

    // count classes
    var classes = {};
    root.each(function(d) {
      if (d.data.sig && visData.map[d.data.sig]) {
        classes[visData.map[d.data.sig].parent] = true;
      } else {
        console.log(d);
      } 
    });
    scales.color.class.domain(Object.keys(classes));

    drawFromRoot(root);
}

function drawFromRoot(root) {
  currentRoot = root;
  drawTraditionalStraight("traditional", root.copy());
}

function drawNodes(g, nodes, depth, raise, root) {

  // update
  var select = g.selectAll("circle")
    .data(nodes)
    .attr("r", 8)
      .attr("cx", ((!hor) ? x : y))
      .attr("cy", ((!hor) ? y : x))
      .attr("id", function(d) { return d.data.name; })
      .attr("sig", function(d) { return d.data.sig; })
      .style("fill", function(d) {
         var c;
         if (!visData.map[d.data.sig]) {
            c = 'none';
         } else {
            c = visData.map[d.data.sig].parent;
         }
         return scales.color.class(c); 
      });

  select.raise();

  // enter
  select.enter()
    .append("circle")
      .attr("r", 8)
      .attr("cx", ((!hor) ? x : y))
      .attr("cy", ((!hor) ? y : x))
      .attr("id", function(d) { return d.data.name; })
      .attr("sig", function(d) { return d.data.sig; })
      .attr("class", function(d)
        { return ((d.depth == 0) ? "root " : "") + "node" })
      .style("fill", function(d) {
         var c;
         if (!visData.map[d.data.sig]) {
            c = 'none';
         } else {
            c = visData.map[d.data.sig].parent;
         }
         return scales.color.class(c); 
      })
      .on("mouseover.tooltip", function(d) {
        show_tooltip(g, d3.select(this));
        d3.select(this).classed("selected", true);
        if (raise) {
          d3.select(this).raise();
        }
      })
      .on("mouseout.tooltip", function(d) {
        g.select("#tooltip").remove();
        d3.select(this).classed("selected", false);
      })
      .on("click", function(d) {
        g.select("#tooltip").remove();
        if (d.depth == 0) {
          var parent = parents.pop();
          if (parent != null) {
            drawFromRoot(parent);
          }
        } else {
          var p = [];
          var pd = d;
          for (var i = 0; i < d.depth; i++) {
            p.unshift(pd.parent.copy());
            pd = pd.parent;
          }
          parents = parents.concat(p);
          drawFromRoot(d);
        }
      });

  // exit
  select.exit().remove();

}

function drawLinks(g, links, generator) {

  // update
  var paths = g.selectAll("path")
    .data(links)
    .attr("d", generator);

  // enter
  paths.enter()
    .append("path")
    .attr("d", generator)
    .attr("class", "link");

  // exit
  paths.exit().remove();

}

function drawLegend(g, root) {

  // get all classes
  var classes = {};
  root.each(function(d) {
    if (visData.map[d.data.sig]) {
      classes[visData.map[d.data.sig].parent] = true;
    }
  });

  // update
  var labels = g.selectAll("g.label")
    .data(Object.keys(classes))
    .attr("transform", function(d,i) { return translate(10, 10+(20*i++)); });

  labels.select("rect")
    .attr("fill", function(d) {
      return scales.color.class(d);
    });

  labels.select("text")
    .text(function(d) { return d; });


  // enter
  var gs = labels.enter()
    .append("g")
    .attr("class", "label")
    .attr("transform", function(d,i) { return translate(10, 10+(20*i++)); });

  gs.append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", function(d) {
     return scales.color.class(d);
    });

  gs.append("text")
      .attr("dx", 12)
      .attr("dy", 10)
      .text(function(d) { return d; });

  // exit
  labels.exit().remove();

}

function drawTraditionalStraight(id, root, parent) {

  var g = svg.select('#plot');
  var leg = svg.select('#legend');
  var nodes = null;
  var links = null;

  var w = config.w - config.rpad - config.lpad;
  var h = config.h - config.tpad - config.bpad;

  // setup node layout generator
  var tree = d3.tree()
    .size([ ((!hor) ? w : h),
            ((!hor) ? h : w)  ])
    .separation(function separation(a, b) {
      return ((a.parent == root) && (b.parent == root)) ? 10 : 5;
    });

  // run layout to calculate x, y attributes
  tree(root);

  // avoid root node if null
  if (!root.data.sig) {
    nodes = root.descendants().slice(1);
    links = root.links().filter(function (d) {
      return d.source.depth != 0;
    });
  } else {
    nodes = root.descendants();
    links = root.links();
  }

  // normal line generator
  var line = d3.line()
    .x(((!hor) ? x : y))
    .y(((!hor) ? y : x));

  // create line generator
  var straightLine = function(d) {
    return line([d.source, d.target]);
  }

  drawLinks(g, links, straightLine);
  drawNodes(g, nodes, true, true, root, parent);
  drawLegend(leg, root);
}