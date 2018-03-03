const {ipcRenderer} = require('electron');
const nsh = require('node-syntaxhighlighter');

let visData = null;

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
let config = {
    w: 800,
    h: 750,
    r: 4,
    tpad: 50,
    lpad: 200,
    bpad: 50,
    rpad: 50
};

// maximum diameter of circle is minimum dimension
config.d = Math.min(config.w, config.h);

let svg = d3.select("body").select("svg");

// dynamic globals
let hor = false;
let parents = [];
let currentRoot = null;

// setup scales
let scales = {};
scales.color = {};
scales.color.class = d3.scaleOrdinal(d3.schemeCategory20c);
scales.radius = d3.scaleSqrt().range([6, 25]);

// accessor functions for x and y
let x = function(d) { return d.x; };
let y = function(d) { return d.y; };

// radius to area
let rectDimens = function(v) { return (3.14 / 2) * scales.radius(v); };

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
  let parts = row.name.split(".")
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
      if (visData.mthd_map[root.children[i].data.sig] &&visData.mthd_map[root.children[i].data.sig].parent == sel.value) {
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

    console.log(visData);
    console.log("data:", data.length, data);

    // create hierarchy
    let stratify = d3.stratify()
      .id(function(d) { return d.id; })
      .parentId(function(d) {
        return d.id.substring(0, d.id.lastIndexOf("."));
      });

    // convert csv into hierarchy
    let realroot = stratify(data);
    let root = selectRoot(realroot.copy(), visData.root);
    console.log("realroot:", realroot);
    console.log("root", root);

    svg.attr("width", config.w);
    svg.attr("height", config.h);

    let g = svg.append("g");
    g.attr("id", "plot");
    g.attr("transform", translate(config.lpad, config.tpad));

    let leg = svg.append("g");
    leg.attr("id", "legend");
    leg.attr("transform", translate(0, 50));

    // count classes
    let classes = {};
    root.each(function(d) {
      if (d.data.sig && visData.mthd_map[d.data.sig]) {
        classes[visData.mthd_map[d.data.sig].parent] = true;
      } else {
        console.log(d);
      } 
    });
    scales.color.class.domain(Object.keys(classes));

    drawFromRoot(root);
}

function drawFromRoot(root) {
  currentRoot = root;
  scales.radius.domain(getTimeDomain(root));
  drawTraditionalStraight("traditional", root.copy());
  updateCodeView(root)
}

function updateCodeView(root) {
  let block = document.getElementById("code-block");
  let cls = visData.class_map[visData.mthd_map[root.data.sig].parent];

  if (cls) {
    block.innerHTML = nsh.highlight(cls.src_content, nsh.getLanguage('java'));
  } else {
    console.log("ERROR");
  }
}

function highlightLineNumber(lineNum) {
  unhighlightLines();

  let block = document.getElementById("code-block");
  let line = d3.selectAll("div.line.number" + lineNum);
  if (!line) {
    console.log("Line out of bounds!")
  } else {
    line.classed("highlighted", true);
    block.parentNode.scrollTop = line.node().offsetTop - 200;
  }
}

function unhighlightLines() {
  let line = d3.selectAll("div.line");
  line.classed("highlighted", false);
}

function getTimeDomain(root) {
  let min = null;
  let max = null;
  root.each(function (e) {
    if (!min || e.data.time < min) {
      min = e.data.time;
    }
    if (!max || e.data.time > max) {
      max = e.data.time;
    }
  });
  return [min, max];
}

function drawNodes(g, nodes, depth, raise, root) {

  let all;
  let oldGroups = g.selectAll("g.node-g")
              .data(nodes);

  // update circle/square
  oldGroups.each(function(d, j) {
    let node = d3.select(this);
    node.selectAll("circle,rect").remove();
    if (!d.data.new_thread) {
      node.append("circle");
    } else {
      node.append("rect");
    }
  });

  // enter
  let newGroups = oldGroups.enter()
                      .append("g")
                      .attr("class", "node-g");

  newGroups.append(function(d) {
    let elem;
    if (!d.data.new_thread) {
      elem = "circle";
    } else {
      elem = "rect";
    }
    return document.createElementNS("http://www.w3.org/2000/svg", elem);
  });

  newGroups.append('text')

  // draw all
  all = oldGroups.merge(newGroups)
  drawCircles(all.select("circle"), g, raise);
  drawRects(all.select("rect"), g, raise);
  drawText(all.select("text"));
  all.raise();

  // exit
  oldGroups.exit().remove();

}

function drawText(sel) {
  sel
    .attr("class", "agg-text")
    .text(function(d) { return ((d.data.agg) ? d.data.agg.times.length : ""); })
    .attr("x", function(d) {
      let pos = (!hor) ? x(d) : y(d);
      let offset;
      if (!d.data.new_thread) {
        offset = d3.select(this.parentNode).select("circle").attr("r");
      } else {
        offset = d3.select(this.parentNode).select("rect").attr("width");
      }
      return pos + Math.round(offset) + 5;
    })
    .attr("y", function(d) {
      let pos = (!hor) ? y(d) : x(d);
      let offset;
      if (!d.data.new_thread) {
        offset = d3.select(this.parentNode).select("circle").attr("r");
      } else {
        offset = d3.select(this.parentNode).select("rect").attr("width");
      }
      return pos + Math.round(offset) + 5;
    });
}

function drawNode(sel, g, raise) {
  sel
    .attr("id", function(d) { return d.data.name; })
    .attr("sig", function(d) { return d.data.sig; })
    .attr("time", function(d) { return d.data.time; })
    .attr("class", function(d)
      { return ((d.depth == 0) ? "root " : "") + "node" + ((d.data.new_thread) ? " newthread" : ""); })
    .style("fill", function(d) {
       let c;
       if (!visData.mthd_map[d.data.sig]) {
          c = 'none';
       } else {
          c = visData.mthd_map[d.data.sig].parent;
       }
       return scales.color.class(c); 
    })
    .on("mouseover.tooltip", function(d) {
      show_tooltip(g, d3.select(this));
      d3.select(this).classed("selected", true);
      if (raise) {
        d3.select(this).raise();
      }

      if (d.depth != 0) {
        highlightLineNumber(d.data.call.line);
      }
    })
    .on("mouseout.tooltip", function(d) {
      g.select("#tooltip").remove();
      d3.select(this).classed("selected", false);
    })
    .on("click", function(d) {
      g.select("#tooltip").remove();
      if (d.depth == 0) {
        let parent = parents.pop();
        if (parent != null) {
          drawFromRoot(parent);
        }
      } else {
        let p = [];
        let pd = d;
        for (let i = 0; i < d.depth; i++) {
          p.unshift(pd.parent.copy());
          pd = pd.parent;
        }
        parents = parents.concat(p);
        drawFromRoot(d);
      }
    });
}

function drawCircles(sel, g, raise) {
  sel
    .attr("cx", ((!hor) ? x : y))
    .attr("cy", ((!hor) ? y : x))
    .attr("r", function(d) {
      if (d.data.time) {
        return scales.radius(d.data.time);
      } else {
        return scales.radius.range()[0];
      }
    });

  drawNode(sel, g, raise);
}

function drawRects(sel, g, raise) {
  sel
    .attr("width", function(d) { return rectDimens(d.data.time); })
    .attr("height", function(d) { return rectDimens(d.data.time); })
    .attr("x", function(d) {
      return ((!hor) ? x(d) : y(d)) - 
              rectDimens(d.data.time)/2;
    })
    .attr("y", function(d) {
      return ((!hor) ? y(d) : x(d)) -
               rectDimens(d.data.time)/2;
    })
    
    drawNode(sel, g, raise);
}

function drawLinks(g, links, generator) {

  // update
  let paths = g.selectAll("path")
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
  let classes = {};
  root.each(function(d) {
    if (visData.mthd_map[d.data.sig]) {
      classes[visData.mthd_map[d.data.sig].parent] = true;
    }
  });

  // update
  let labels = g.selectAll("g.label")
    .data(Object.keys(classes))
    .attr("transform", function(d,i) { return translate(10, 10+(20*i++)); });

  labels.select("rect")
    .attr("fill", function(d) {
      return scales.color.class(d);
    });

  labels.select("text")
    .text(function(d) { return d; });


  // enter
  let gs = labels.enter()
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

  let g = svg.select('#plot');
  let leg = svg.select('#legend');
  let nodes = null;
  let links = null;

  let w = config.w - config.rpad - config.lpad;
  let h = config.h - config.tpad - config.bpad;

  // setup node layout generator
  let tree = d3.tree()
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
  let line = d3.line()
    .x(((!hor) ? x : y))
    .y(((!hor) ? y : x));

  // create line generator
  let straightLine = function(d) {
    return line([d.source, d.target]);
  }

  drawLinks(g, links, straightLine);
  drawNodes(g, nodes, true, true, root, parent);
  drawLegend(leg, root);
}