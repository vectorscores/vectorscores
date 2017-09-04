---
layout: compress-js
---

var width = 480,
    maxwidth = 480,
    margin = 20,
    boxwidth = width + (margin * 2),
    center = boxwidth * 0.5,
    debug = +VS.getQueryString("debug") === 1 || false,
    layout = {
        perc: {
            x: 60 + 22, // TODO make this the score left margin
            y: center,
            y1: 16,
            y2: 60 + 16
        },
    };

{% include_relative _globjects.js %}
{% include_relative _rhythms.js %}
{% include_relative _score.js %}

var main = d3.select(".main")
    .classed("debug", debug)
    .style("width", boxwidth + "px")
    .style("height", boxwidth + "px");

var globjectContainer = main.append("g")
    .attr("class", "globjects")
    .attr("transform", "translate(" + 0 + "," + 90 + ")")

var durationText = globjectContainer.append("text")
    .attr("class", "duration-text")
    .attr("transform", "translate(" + layout.perc.x + "," + 0 + ")");

/**
 * Rhythm test
 */
var percussionParts = main.append("g")
    .attr("transform", "translate(" + layout.perc.x + "," + layout.perc.y + ")")
    .attr("class", "percussion-parts");

var tempoText = percussionParts.append("text")
    .attr("class", "tempo-text");

tempoText.append("tspan")
    .text(stemmed["1"]);

var perc1 = percussionParts.append("g")
    .attr("transform", "translate(" + 0 + "," + layout.perc.y1 + ")");

var perc2 = percussionParts.append("g")
    .attr("transform", "translate(" + 0 + "," + layout.perc.y2 + ")");

percussionParts.selectAll("g").call(function(selection) {
    selection.append("text")
        .style("font-family", "Bravura")
        .attr("x", -22)
        .attr("y", 22)
        .text("\ue069");

    function createRhythmCell(g) {
        var cell = g.append("g")
            // .attr("transform", "translate(" + 22 + "," + 0 + ")")
            .attr("class", "rhythm");

        cell.append("rect")
            .attr("height", 45)
            .attr("stroke", "#888")
            .attr("fill", "none");

        cell.append("text")
            .attr("dx", 11)
            .attr("y", 30);
    }

    // create two rhythm cells
    selection.call(createRhythmCell);
    selection.call(createRhythmCell);
});

/**
 *
 */
function update(index) {
    /**
     * Globjects
     * TODO stash globect generator elsewhere?
     */
    var h = 90;

    d3.selectAll(".globject").remove();

    var globject = VS.globject()
        .width(function(d) { return d.width; })
        .height(h);

    globjectContainer.selectAll(".globject")
        .data(score[index].globjects)
        .enter()
        .append("g")
        .each(globject)
        .each(centerGlobject);

    durationText.text(score[index].duration + "\u2033");// "\u2033"

    /**
     * Tempo
     */
    var tempo = score[index].tempo;

    tempoText.select(".bpm").remove();

    tempoText.append("tspan")
        .attr("class", "bpm")
        .text(" = " + tempo);

    percussionParts
        // .transition().duration(300) // TODO fade in/out as part of event, not on start of event
        .style("opacity", tempo ? 1: 0);

    /**
     * Rhythms
     * TODO stash creation functions elsewhere?
     */
    function createRhythm() {
        var selection = d3.select(this),
            textEl = selection.select("text");

        textEl.selectAll("tspan").remove();

        if (!tempo) {
            return;
        }

        var randRhythm = VS.getItem(rhythms.filter(function(r) {
            return r !== percRhythm; // prevent duplicates within each part
        }));

        percRhythm = randRhythm;

        var symbols = randRhythm.split(",");

        for (var si = 0; si < symbols.length; si++) {
            var symbol = symbols[si],
                dy = symbol === "r0.5" || symbol === "r0.5." ? 0.4 : 0;

            textEl.append("tspan")
                .style("baseline-shift", dy + "em")
                .text(stemmed[symbol]);
        }

        var textWidth = textEl.node().getBBox().width;
        // TODO set d.width

        selection.select("rect").attr("width", textWidth + 22);
    }

    function spacePerc(d, i) {
        var selection = d3.select(this);

        var width = selection.node().getBBox().width;
        var xOffset = percPos + (i * 11);
        percPos += width;
        // TODO get d.width

        selection.attr("transform", "translate(" + xOffset + "," + 0 + ")");
    }

    var percPos = 0;
    var percRhythm = "";
    perc1.selectAll(".rhythm")
        .each(createRhythm)
        .each(spacePerc);

    percPos = 0;
    percRhythm = "";
    perc2.selectAll(".rhythm")
        .each(createRhythm)
        .each(spacePerc);
}

function centerGlobject(d) {
    d3.select(this).attr("transform", "translate(" + layout.perc.x + "," + 16 + ")");
}


/**
 * Resize
 */
function resize() {
    // update width
    boxwidth = Math.min( parseInt(d3.select("main").style("width"), 10), maxwidth);
    center = boxwidth * 0.5;
    width = boxwidth - (margin * 2);

    main
        .style("width", boxwidth + "px")
        .style("height", boxwidth + "px");

    d3.selectAll(".globject").each(centerGlobject);
}

resize();

d3.select(window).on("resize", resize);

/**
 * Populate score
 */
var addEvent = (function() {
    var time = 0;

    return function(fn, duration, args) {
        VS.score.add(time, fn, args);
        time += duration;
    };
})();

for (var i = 0; i < score.length; i++) {
    addEvent(update, score[i].duration * 1000, [i])
}

/**
 * Initialize score
 */
d3.select(window).on("load", function () {
    update(0);
});

/**
 * Score controls
 */
VS.control.stopCallback = function() { update(0); };
VS.control.stepCallback = function() { update(VS.score.pointer); };
