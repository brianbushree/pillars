const {ipcRenderer} = require('electron');

/* Request data from main process */
var visData = null;
ipcRenderer.send('data-req');
ipcRenderer.on('data-res', function (e, data) {
  data.data.forEach(function(e, i) {
    e.name = e.id;
    e = convert(e);
  });
  visData = data;
  callback(null, visData.data); 
});

function newRoot() {
  ipcRenderer.send('new_root');
}

// setup scales
var scales = {};
scales.color = {};
scales.color.depth = d3.scaleOrdinal();
scales.color.class = d3.scaleOrdinal(d3.schemeCategory20c);
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

var parents = [];

function convert(row) {
  row.id = row.name;
  var parts = row.name.split(".")
  row.name = parts[parts.length - 1];
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

    // create hierarchy
    var stratify = d3.stratify()
      .id(function(d) { return d.id; })
      .parentId(function(d) {
        return d.id.substring(0, d.id.lastIndexOf("."));
      });

    // convert csv into hierarchy
    var realroot = stratify(data);
    var root = realroot;

    root = selectRoot(root, visData.root);
    console.log("realroot:", realroot);

    var svg = d3.select("body").select("svg");
    svg.attr("width", config.w);
    svg.attr("height", config.h);

    var g = svg.append("g");
    g.attr("id", "plot");
    g.attr("transform", translate(config.lpad, config.tpad));

    var leg = svg.append("g");
    leg.attr("id", "legend");
    leg.attr("transform", translate(0, 50));


    // count classes
    var m = {};
    root.each(function(d) {
      if (!visData.map[d.data.sig]) {
        m['none'] = true;
      } else {
        m[visData.map[d.data.sig].parent] = true;
      }
    });
    scales.color.class.domain(Object.keys(m).length);

    drawFromRoot(root);
}

function drawFromRoot(root, data) {
    scales.color.depth.domain(d3.range(root.height + 1));
    scales.color.depth.range(d3.schemeGnBu[((root.height + 1)%10 < 3) ? 3 : (root.height + 1)%10]);

    drawTraditionalStraight("traditional", root.copy());
}

function drawNodes(g, nodes, depth, raise, root) {

  // update
  var select = g.selectAll("circle")
    .data(nodes)
    .attr("r", 8)
      .attr("cx", x)
      .attr("cy", y)
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
      .attr("cx", x)
      .attr("cy", y)
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
  var m = {};
  root.each(function(d) {
    if (!visData.map[d.data.sig]) {
      m['none'] = true;
    } else {
      m[visData.map[d.data.sig].parent] = true;
    }
  });

  var labels = g.selectAll("g.label")
    .data(Object.keys(m))
    .attr("transform", function(d,i) { return translate(10, 10+(20*i++)); });

  labels.select("rect")
    .attr("fill", function(d) {
      return scales.color.class(d);
    });

  labels.select("text")
    .text(function(d) { return d; });


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

  labels.exit().remove();

}

function drawTraditionalStraight(id, root, parent) {

  var g = d3.select('#plot');
  var leg = d3.select('#legend');

  // setup node layout generator
  var tree = d3.tree()
    .size([ config.w - config.rpad - config.lpad,
            config.h - config.tpad - config.bpad  ]);

  // run layout to calculate x, y attributes
  tree(root);

  // create line generator
  var straightLine = function(d) {
    return line([d.source, d.target]);
  }

  scales.radius.range([3, 35]);

  drawLinks(g, root.links(), straightLine);
  drawNodes(g, root.descendants(), true, true, root, parent);
  drawLegend(leg, root);
}