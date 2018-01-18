function show_tooltip(g, node) {
  // get bounding box of group BEFORE adding text
  var gbox = g.node().getBBox();

  // get bounding box of node
  var nbox = node.node().getBBox();

  // calculate shift amount
  var shift_x = nbox.width/2;
  var shift_y = nbox.height/2;

  // retrieve node attributes (calculate middle point)
  var x = nbox.x + shift_x;
  var y = nbox.y + shift_y;

  var label = node.attr("sig");
  var val = "";

  // create tooltip
  var tooltip = g.append("g")
      .attr("id", "tooltip");

  tooltip.append("text")
    .text(label)
    .attr("x", x)
    .attr("y", y)
    .attr("dy", -shift_y - 8) // shift upward above circle
    .attr("text-anchor", "middle") // anchor in the middle
    .attr("transform", translate(0, -12));

  tooltip.append("text")
    .text(val)
    .attr("x", x)
    .attr("y", y)
    .attr("dy", -shift_y - 4) // shift upward above circle
    .attr("text-anchor", "middle"); // anchor in the middle

  var text = tooltip.selectAll("text");

  // set tooltip style
  text.style("font-size", "10pt")
    .style("font-weight", "900")
    .style("fill", "black")
    .style("stroke", "white")
    .style("stroke-width", "0.25px");

  // it is possible the tooltip will fall off the edge of the
  // plot area. we can detect when this happens, and set the
  // text anchor appropriately

  // get bounding box for the text
  var tbox = tooltip.node().getBBox();

  // if text will fall off left side, anchor at start
  if (tbox.x < gbox.x) {
    text.attr("text-anchor", "start");
    text.attr("dx", -shift_x); // nudge text over from center
  }
  // if text will fall off right side, anchor at end
  else if ((tbox.x + tbox.width) > (gbox.x + gbox.width)) {
    text.attr("text-anchor", "end");
    text.attr("dx", shift_x);
  }

  // if text will fall off top side, place below circle instead
  if (tbox.y < gbox.y) {
    text.attr("dy", shift_y + tbox.height + 10);
  }
}