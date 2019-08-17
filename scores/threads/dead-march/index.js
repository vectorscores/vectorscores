(function () {
  'use strict';

  const data = [{ x: 0, y: 50 }, { x: 0, y: 100 }];

  function drone(selection) {
    selection
      .selectAll(".drone")
      .data(data)
      .enter()
      .append("line")
      .attr("class", "drone")
      .attr("x1", 0)
      .attr("x2", 100)
      .attr("y1", d => d.y)
      .attr("y2", d => d.y);
  }

  const main = d3.select(".main");
  const wrapper = main.append("g");

  drone(wrapper);

  // as low, slow (breath, bow speed) as possible/audible
  wrapper
    .append("text")
    .text("LNP ->")
    .attr("dy", "2em");

  // ensemble comes in and out of LNP for highlighting threads?

}());
