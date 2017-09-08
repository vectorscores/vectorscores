---
layout: compress-js
---

var canvas = {
        margins: 20,
        maxWidth: 400,
        width: null,
        center: null
    },
    transitionTime = {
        long: 5000,
        short: 600
    },
    scoreLength = 12,
    textoffset = 5,
    debug = VS.getQueryString("debug") == 1 || false,
    main = d3.select(".main");

var globInterval = transitionTime.long * 3;

{% include_relative _glob.js %}
{% include_relative _settings.js %}

var durationDict = VS.dictionary.Bravura.durations.stemless;

function newPoint() {
    var radius = VS.getRandExcl(1, 96),
        angle = Math.random() * Math.PI * 2,
        dist = Math.random() - Math.random();
    return {
        x: Math.cos(angle) * radius * dist,
        y: Math.sin(angle) * radius * dist
    };
}

var glob = new Glob(main, 20);
glob.width = 240;
glob.group.selectAll("text")
    .data(glob.data).enter()
    .append("text")
    .classed("glob-child", 1)
    .text(function() {
        return durationDict[VS.getItem([1, 1.5, 2, 3, 4])];
    });
glob.children = d3.selectAll("text");

glob.pitchSet = main.append("text")
    .classed("pc-set", 1)
    .style("opacity", "0"); // init value

glob.move = function(dur, type) {
    var pcSet = VS.pitchClass.transpose(VS.getItem(VS.trichords), "random").map(function(pc) {
        return VS.pitchClass.format(pc, scoreSettings.pcFormat);
    });

    glob.pitchSet
        .attr("x", canvas.center)
        .attr("y", canvas.width - textoffset)
        .text(function() {
            return "{" + pcSet.join(", ") + "}";
        })
        // fade in if needed
        .transition().duration(transitionTime.short)
        .style("opacity", "1");

    glob.children
        .transition().duration(dur)
        // .attr("text-anchor", type === "chord" ? "start" : "middle")
        .attr("text-anchor", "start")
        .attr("transform", function() {
            var point = newPoint();
            if (type === "chord") {
                point.x = 0; // VS.getItem([0, 40, -40]); // multiple chords
            } else if (type === "rhythm") {
                point.y = 0;
            }
            return "translate(" + point.x + ", " + point.y + ")";
        });
};

for(var i = 0; i < scoreLength; i++) {
    VS.score.add(i * globInterval, glob.move, [transitionTime.long, VS.getItem(["glob", "chord", "rhythm"])]);
}
// final event
VS.score.add(scoreLength * transitionTime.long, function() {
    d3.select(".pc-set")
        .transition().duration(transitionTime.short)
        .style("opacity", "0");
});

VS.score.preroll = 1000;

VS.control.stepCallback = function() {
    glob.move(transitionTime.short);
};

VS.score.stopCallback = function() {
    glob.pitchSet
        .transition().duration(transitionTime.short)
        .style("opacity", "0");
    glob.children
        .transition().duration(transitionTime.short)
        .attr("transform", "translate(0, 0)");
};


// resize

d3.select(window).on("resize", resize);

function resize() {
    // update width
    canvas.width = Math.min( parseInt(d3.select("main").style("width"), 10), canvas.maxWidth);
    canvas.center = canvas.width * 0.5;
    var innerwidth = canvas.width - (canvas.margins * 2);

    main
        .style("width", canvas.width + "px")
        .style("height", canvas.width + "px");
    glob.group.attr("transform",
        "translate(" + canvas.center + ", " + canvas.center + ")" +
        "scale(" + (canvas.width / glob.width) + "," + (canvas.width / glob.width) + ")"
        );
    glob.pitchSet
        .attr("x", canvas.center)
        .attr("y", canvas.width - textoffset);

    if(debug){
        d3.select("rect")
            .attr("width", innerwidth)
            .attr("height", innerwidth);
        d3.select("circle")
            .attr("transform", "translate(" + canvas.center + ", " + canvas.center + ")");
    }
}

resize();

if(debug) {
    main.classed("debug", true);
    main.append("rect")
        .attr("width", canvas.width - (canvas.margins * 2))
        .attr("height", canvas.width - (canvas.margins * 2))
        .attr("transform", "translate(" + canvas.margins + ", " + canvas.margins + ")");
    main.append("circle")
        .attr("r", 5)
        .attr("transform", "translate(" + canvas.center + ", " + canvas.center + ")");
}
