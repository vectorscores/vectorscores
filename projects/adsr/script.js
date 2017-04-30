---
# // adapted from original SuperCollider code
---
/**
 * TODO
 * score.width can be 8000 but svg width does not need to be
 * display pitch and timbre inline--and only if there is a change (or make that optional)
 * bounding boxes for phrases? make optional setting?
 * allow option to show note names? or pitch classes?
 * double bar
 * error-check if score height exceeds view and/or auto-scale to fit
 * current bar indicator (not debug line)--similar to storyboard indicator?
 * also use flashing indicator when the piece is starting, to time the snap pizz
 */
 var unit = 10,
     // calculated in resize()
     view = {
         width: 0,
         height: 0,
         center: 0
     },
     numParts = +VS.getQueryString("parts") || 4,
     debug = false;

var score = (function() {
    var _score = {};

    _score.width = 8000;
    _score.svg = d3.select(".main").attr("width", _score.width);
    _score.group = _score.svg.append("g");
    _score.layout = {
        group: _score.group.append("g").attr("class", "layout")
    };
    // to help track overall part height
    _score.partLayersY = {
        timbre: -4.5 * unit,
        pitch: -2.5 * unit,
        durations: function(d) { return (d > 0 && d < 1) ? -0.5 * unit : 0; },
        articulations: 1.25 * unit,
        dynamics: 3.5 * unit
    };
    // calculated from above/rendered
    _score.partHeight = 12 * unit;

    _score.layoutLayersY = {
        rehearsalLetters: unit * -2,
        barlines: {
            y1: 3 * unit,
            y2: (numParts * _score.partHeight) + (6 * unit)
        },
        barDurations: unit
    };
    _score.height = _score.layoutLayersY.rehearsalLetters + _score.layoutLayersY.barlines.y2;
    // offset to start first part
    _score.layoutHeight = 12 * unit;

    return _score;
})();

// symbol dictionary
{% include_relative _symbols.js %}

// generate score
{% include_relative _score.js %}

function getBarDuration(ndex) {
    return score.bars[ndex + 1] - score.bars[ndex];
}
function getBarlineX(bar) {
    return (score.width * bar) / score.totalDuration;
}
function decimalRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

// create barlines
score.layout.group
    .append("g")
    .selectAll("line")
    .data(score.bars)
    .enter()
    .append("line")
        .attr("x1", 0)
        .attr("y1", score.layoutLayersY.barlines.y1)
        .attr("x2", 0)
        .attr("y2", score.layoutLayersY.barlines.y2)
    .attr("transform", function(d) {
        return "translate(" + getBarlineX(d) + ", " + 0 + ")";
    });

// show durations over barlines
score.layout.group
    .append("g")
    .selectAll("text")
    .data(score.bars)
    .enter()
    .append("text")
        .text(function(d, i) {
            var dur = getBarDuration(i);
            // do not display last bar's duration
            return i < score.bars.length - 1 ? decimalRound(dur, 1) + "\u2033" : "";
        })
        .classed("duration", 1)
        .attr("transform", function(d) {
            return "translate(" + getBarlineX(d) + ", " + score.layoutLayersY.barDurations + ")";
        });

// show rehearsal letters
score.layout.letters = score.layout.group.append("g")
    .selectAll("g")
    .data(score.rehearsalLetters)
    .enter()
    .append("g")
    .attr("transform", function(d) {
        return "translate(" + getBarlineX(score.bars[d.index]) + ", " + score.layoutLayersY.rehearsalLetters + ")";
    });
score.layout.letters.each(function() {
    var thisLetter = d3.select(this);

    thisLetter.append("rect")
        .attr("y", -15)
        .attr("width", 20)
        .attr("height", 20);

    thisLetter.append("text")
        .text(function(d) {
            return d.letter;
        })
        .attr("dx", "0.25em");
});

/**
 * Ghost beams, for use in score and in performance notes
 */
function makeGhost(firstDur) {
    firstDur = firstDur * unit + 5; // duration of the note the "ghost" is tied to, with 5px offset
    var x1 = 10, // offset to tie
        attackScale = 0.5,
        attackNum = VS.getItem([7, 8, 9]);
    function ghostAttackSpacing(d, i) {
        return x1 + (unit * i * attackScale);
    }

    var ghostGroup = d3.select(this).append("g")
        .attr("transform", "translate(" + firstDur + ", 0)");

    ghostGroup
        .append("text")
            .text(artDict["tie"])
            .classed("durations", true)
            .attr("y", score.partLayersY.articulations);
    ghostGroup
        .append("line")
            .attr("class", "ghost-beam")
            .attr("x1", x1)
            .attr("y1", 0)
            .attr("x2", x1 + (unit * attackNum * attackScale))
            .attr("y2", 0);
    ghostGroup.selectAll(".ghost-attack")
        .data(d3.range(attackNum))
        .enter()
        .append("line")
            .attr("class", "ghost-attack")
            .attr("x1", ghostAttackSpacing)
            .attr("y1", 0)
            .attr("x2", ghostAttackSpacing)
            .attr("y2", unit);
}

/**
 * Draw parts
 */
for (p = 0; p < numParts; p++) {
    var thisPart = parts[p],
        partYPos = score.layoutHeight + (p * score.partHeight),
        partGroup = score.group.append("g");

    partGroup.attr("transform", "translate(0, " + partYPos + ")");

    // for each phrase, create a group around a barline
    partGroup.selectAll("g")
        .data(score.bars)
        .enter()
        .append("g")
        .attr("transform", function(d, i) {
            var x = getBarlineX(d) + (thisPart[i].timeDispersion * unit * 2.5); // scale dispersion
            return "translate(" + x + ", " + 0 + ")";
        })
        // add phrase content
        .each(function(d, i) {
            var thisPhrase = thisPart[i];
            var prevPhrase = thisPart[i - 1];
            var durations = thisPhrase.durations;
            var dynamics = thisPhrase.dynamics;
            var articulations = thisPhrase.articulations;
            var layersY = score.partLayersY;

            function phraseSpacing(d, i) {
                var upToI = durations.slice(0, i),
                    sum = upToI.reduce(function(a, b) {
                        return a + b + 1; // add padding between here
                    }, 0);
                return sum * unit;
            }

            function getNestedProp(prop, obj) {
                return prop.split(".").reduce(function(prev, curr) {
                    return prev[curr];
                }, obj || this );
            }

            function hasNewValues(prop) {
                // TODO allow settings to show all (per property? showAll.indexOf(prop))
                return i === 0 || getNestedProp(prop, thisPhrase) !== getNestedProp(prop, prevPhrase);
            }

            if (thisPhrase.timbre !== "bartok" && thisPhrase.timbre !== "ghost") {
                if(hasNewValues("timbre")) {
                    d3.select(this).append("text")
                        .text(thisPhrase.timbre)
                        .attr("class", "timbre")
                        .attr("y", layersY.timbre);
                }
            } else if (thisPhrase.timbre === "bartok") {
                d3.select(this).append("text")
                    .text(artDict["bartok"])
                    .attr("class", "bartok")
                    .attr("y", layersY.timbre);
            }

            if(hasNewValues("pitch.low") || hasNewValues("pitch.high")) {
                d3.select(this).append("text")
                    .text(function() {
                        var lo = thisPhrase.pitch.low,
                            hi = thisPhrase.pitch.high;
                        return "\uec82 " + pitchDict[lo] + ( (lo !== hi) ? (" \uf479 " + pitchDict[hi]) : "" ) + " \uec83"; // tenuto as endash
                    })
                    .classed("pitch-range", true)
                    .attr("y", layersY.pitch);
            }

            d3.select(this).selectAll(".durations")
                .data(durations)
                .enter()
                .append("text")
                    .text(function(d) { return durDict[d]; })
                    .classed("durations", true)
                    // if flag without notehead, offset y position
                    // TODO do not offset dot?
                    .attr("y", layersY.durations)
                    .attr("x", phraseSpacing);
            // // save this, could be an interesting setting to toggle
            // // also, modify box height by pitch range
            // d3.select(this).selectAll(".durations")
            //     .data(durations)
            //     .enter()
            //     .append("rect")
            //         .attr("rx", 1)
            //         .attr("x", phraseSpacing)
            //         .attr("y", function(d, i) { return 0; })
            //         .attr("width", function(d) { return d * unit; })
            //         .attr("height", unit);

            if (thisPhrase.timbre === "ghost") {
                makeGhost.call(this, durations[0]);
            }

            // articulations
            d3.select(this).selectAll(".articulations")
                .data(articulations)
                .enter()
                .append("text")
                    .text(function(d) { return artDict[d]; })
                    .classed("durations", true)
                    .attr("y", layersY.articulations)
                    .attr("x", phraseSpacing)
                    .attr("dx", function(d) {
                        return d === "l.v." ? unit : 0;
                    })
                    .attr("dy", function(d) {
                        return d === "l.v." ? unit * -0.5 : 0;
                    });

            // dynamics
            if(durations.length > 1 || hasNewValues("dynamics.0")) {
                d3.select(this).selectAll(".dynamics")
                    .data(dynamics)
                    .enter()
                    .append("text")
                        .text(function(d) { return dynamicsDict[d]; })
                        .attr("class", function(d) {
                            return d === "dim." ? "timbre" : "dynamics";
                        })
                        .attr("y", layersY.dynamics)
                        .attr("x", phraseSpacing);
            }
        }); // .each()
}

function scrollScore(ndex, dur, goToNextBar) {
    var targetIndex = goToNextBar ? ndex + 1 : ndex, // true = proceed to next bar, false = go to this bar
        targetBar = score.bars[targetIndex];
    var scoreGroupHeight = score.height * 0.5;
    score.group
        .transition()
        .duration(dur)
        .ease("linear")
        .attr("transform", function() {
            // TODO calculate score vertical center positions on resize and store--don't calc on every scroll
            return "translate(" +
                (view.center - getBarlineX(targetBar)) + "," +
                ((view.height * 0.5) - scoreGroupHeight) +
                ")";
        });
}

/**
 * Populate score
 * Use a preroll so the score doesn't start scrolling immediately // TODO allow user to define this value
 */
// VS.score.preroll = 600;

for(i = 0; i < score.bars.length; i++) {
    var duration = getBarDuration(i);
    VS.score.add(score.bars[i] * 1000, scrollScore, [i, duration * 1000, true]);
}

VS.score.pauseCallback = function(){ scrollScore(VS.score.pointer, 300, false); };
VS.score.stopCallback = function(){ scrollScore(0, 300, false); };
VS.score.stepCallback = function(){ scrollScore(VS.score.pointer, 300, false); };

{% include_relative _debug.js %}
{% include_relative _settings.js %}

function resize() {
    // TODO pause score if playing
    view.width = parseInt(d3.select("main").style("width"), 10);
    view.center = view.width * 0.5;
    view.height = parseInt(d3.select("main").style("height"), 10);

    score.svg.attr("height", view.height);

    if(debug){ resizeDebug(); }

    scrollScore(VS.score.pointer, [0]);
}

resize();

d3.select(window).on("resize", resize);

/**
 * Performance notes
 */
var infoGhost = d3.select(".info-ghost")
    .attr("width", 60)
    .attr("height", 20)
    .append("g");
// infoGhost.append("text")
//     .attr("class", "durations")
//     .text(artDict["tie"]);
makeGhost.call(infoGhost.node(), 0);
