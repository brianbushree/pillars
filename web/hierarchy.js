const {ipcRenderer} = require('electron');

// var file = "java8.csv";

var scales = {};

scales.color = {};
scales.color.depth = d3.scaleOrdinal();
// scales.color.size = d3.scaleSequential(d3.interpolateGnBu);

scales.radius = d3.scaleSqrt();

// accessor functions for x and y
var x = function(d) { return d.x; };
var y = function(d) { return d.y; };

// normal line generator
var line = d3.line()
  .curve(d3.curveLinear)
  .x(x)
  .y(y);

// configure size, margin, and circle radius
var config = {
    w: 900,
    h: 550,
    r: 4,
    pad: 70
};

// maximum diameter of circle is minimum dimension
config.d = Math.min(config.w, config.h);

// d3.csv(file, convert, callback);

let visData = null;

ipcRenderer.send('data-req');
ipcRenderer.on('data-res', function (e, data) {
  console.log(data);
  data.data.forEach(function(e, i) {
    e.size = '0';
    e.name = e.id;
    e = convert(e);
  });
  visData = data;
  callback(null, visData.data); 
});

function convert(row) {
  row.id = row.name;
  var parts = row.name.split(".")
  row.name = parts[parts.length - 1];
  row.size = +row.size;
  return row;
}

function selectRoot(root, sig) {
  for (let i = 0; i < root.children.length; i++) {
    if (root.children[i].data.sig == visData.root) {
      root = root.children[i];
      break;
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

    // used to create hierarchies
    var stratify = d3.stratify()
      .id(function(d) { return d.id; })
      .parentId(function(d) {
        return d.id.substring(0, d.id.lastIndexOf("."));
      });

    // convert csv into hierarchy
    var real_root = stratify(data);
    var root = real_root;

    root = selectRoot(root, visData.root);

    // sort by height then value
    // https://github.com/d3/d3-hierarchy#node_sort
    // root.sort(function(a, b) {
    //     if (a.height != b.height) {
    //       return d3.ascending(a.height, b.height);
    //     }
    //     else {
    //       return d3.ascending(a.value, b.value);
    //     }
    //   });

    // // save each recursive-size
    // root.sum(function(d) { return d.size; });
    // root.each(function(d) {
    //   d.data.rSize = d.value;
    // });

    console.log("root:", root);
    // var sizeExtent = d3.extent(root.descendants(), function(d) { return d.data.rSize; });

    // setup color scales
    scales.color.depth.domain(d3.range(root.height + 1));
    scales.color.depth.range(d3.schemeGnBu[(root.height + 1)]);
    // scales.color.size.domain(sizeExtent);

    // setup radius scale
    // scales.radius.domain(sizeExtent);

    drawTraditionalStraight("traditional", root.copy());
    // drawCircularDendrogram("circular_dendrogram", root.copy());
}

function drawNodes(g, nodes, depth, raise) {
  g.selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
      .attr("r", 8)
      .attr("cx", x)
      .attr("cy", y)
      .attr("id", function(d) { return d.data.name; })
      .attr("sig", function(d) { return d.data.sig; })
      .attr("class", "node")
      .style("fill", function(d) { return scales.color.depth(d.depth); })
      //.style("fill", "#000")
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
      });
}

function drawLinks(g, links, generator) {
  var paths = g.selectAll("path")
    .data(links)
    .enter()
    .append("path")
    .attr("d", generator)
    .attr("class", "link");
}

function drawTraditionalStraight(id, root) {
  var svg = d3.select("body").select("#" + id);
  svg.attr("width", config.w);
  svg.attr("height", config.h);

  var g = svg.append("g");
  g.attr("id", "plot");
  g.attr("transform", translate(config.pad, config.pad));

  // setup node layout generator
  var tree = d3.tree()
    .size([ config.w - 2 * config.pad,
            config.h - 2 * config.pad]);

  // run layout to calculate x, y attributes
  tree(root);

  // create line generator
  var straightLine = function(d) {
    return line([d.source, d.target]);
  }

  scales.radius.range([3, 35]);

  drawLinks(g, root.links(), straightLine);
  drawNodes(g, root.descendants(), true, true);
}

function drawCircularDendrogram(id, root) {
  var svg = d3.select("body").select("#" + id);
  svg.attr("width", config.w);
  svg.attr("height", config.h);

  var g = svg.append("g");
  g.attr("id", "plot");

  // for polar coordinates, easier if treat (0, 0) as center
  g.attr("transform", translate(config.w / 2, config.h / 2));

  // setup node layout generator
  // let x be theta (in degrees) and y be radial
  var cluster = d3.cluster().size([360, (config.d / 2) - config.pad]);

  // run layout to calculate x, y attributes
  cluster(root);

  // x, y are in polar coordinates
  // must convert back into cartesian coordinates
  root.each(function(d) {
    d.theta = d.x;
    d.radial = d.y;

    var point = toCartesian(d.radial, d.theta);
    d.x = point.x;
    d.y = point.y;
  });

  // create hacky v4 curved link generator for radial
  var curvedLine = function(d) {
    var mid = (d.source.radial + d.target.radial) / 2;
    var v0 = toCartesian(mid, d.source.theta);
    var v1 = toCartesian(mid, d.target.theta);
    return "M" + d.source.x + "," + d.source.y
      + "C" + v0.x + "," + v0.y
      + " " + v1.x + "," + v1.y
      + " " + d.target.x + "," + d.target.y;
  };

  drawLinks(g, root.links(), curvedLine);
  drawNodes(g, root.descendants(), true, true);
}