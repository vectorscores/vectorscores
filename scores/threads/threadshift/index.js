import drone from "../drone";

const main = d3.select(".main");
const wrapper = main.append("g");

// drone(wrapper); // TODO

var durations = VS.dictionary.Bravura.durations.stemless;

function longTone(selection, x, y, duration) {
  const group = selection.append("g");

  group.attr("transform", `translate(${x}, ${y})`);

  group
    .append("text")
    .attr("class", "bravura")
    .text(durations[4]);

  group
    .append("line")
    .attr("x1", "0.5em")
    .attr("x2", x + duration);

  return group;
}

const score = [
  {
    startTime: null,
    duration: null,
    render: ({ startTime, duration }) => {
      const g = longTone(wrapper, startTime, 50, duration);
      g.append("text")
        .text(">")
        .attr("dy", "1em");
      g.append("text")
        .text("p, cres., mf")
        .attr("dy", "2em");
    }
  },
  {
    startTime: null,
    duration: null,
    render: ({ startTime, duration }) => {
      const g = wrapper
        .append("g")
        .attr("transform", `translate(${startTime},50)`);

      g.append("text").text("cluster");
      g.append("text")
        .text("//")
        .attr("x", duration)
        .attr("dx", "-2em");
    }
  },
  {
    startTime: null,
    duration: null,
    render: ({ startTime, duration }) => {
      const g = wrapper
        .append("g")
        .attr("transform", `translate(${startTime},50)`);

      // should this start as sffz, with excessive pressure?
      // and also irregular tremolo?

      // top line
      g.append("line")
        .attr("x1", 0)
        .attr("x2", duration);
      g.append("text")
        .text("sfz, decres. to niente")
        .attr("dy", "-1em");
      g.append("text")
        .text("becoming airy, three noisy patches")
        .attr("dy", "-2em");

      // bottom line
      g.append("line")
        .attr("x1", 0)
        .attr("x2", duration)
        .attr("y2", 50); // TODO curve and draw out, for more beating--also not a linear descent, meaning this should be a path, not a line
      g.append("text")
        .text("sfz, mf, decres. to p")
        .attr("y", 50)
        .attr("dy", "1em");
      g.append("text")
        .text("texture, three cluster hits")
        .attr("y", 50)
        .attr("dy", "2em");
    }
  },
  {
    startTime: null,
    duration: null,
    render: ({ startTime, duration }) => {
      const g = wrapper
        .append("g")
        .attr("transform", `translate(${startTime},50)`);

      // bottom line
      g.append("line")
        .attr("x1", 0)
        .attr("x2", duration)
        .attr("y1", 50)
        .attr("y2", 50);

      // threads
      for (let i = 0; i < 10; i++) {
        let halfDur = duration * 0.5;
        let x = Math.random() * halfDur;
        let dur = x + halfDur;
        let y = Math.random() * 50;
        g.append("line")
          .attr("x1", x)
          .attr("x2", dur)
          .attr("y1", y)
          .attr("y2", y);
      }
    }
  }
].map((bar, i) => {
  // TODO each bar is saet to the same duration during sketching
  const length = 150;
  return { ...bar, duration: length, startTime: length * i };
});

score.forEach(bar => {
  const { render, ...barData } = bar;
  render(barData);
});