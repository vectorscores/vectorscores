---
# // adapted from original SuperCollider code
---

var width = 8000,
    height = 640,
    unit = 10;
    timePoints = [ 0, 6.3858708756625, 10.33255612459, 16.718427000252, 27.050983124842, 37.383539249432, 43.769410125095, 47.716095374022, 50.155281000757, 54.101966249685, 60.487837125347, 66.873708001009, 70.820393249937, 77.206264125599, 81.152949374527, 87.538820250189, 97.871376374779, 108.20393249937, 114.58980337503, 124.92235949962, 131.30823037528, 141.64078649987, 158.35921350013, 175.07764050038, 185.41019662497, 195.74275274956, 212.46117974981, 229.17960675006, 239.51216287465, 245.89803375032, 256.23058987491, 262.61646075057, 272.94901687516, 283.28157299975, 289.66744387541, 293.61412912434, 300 ],
    scoreLength = timePoints[timePoints.length - 1],
    // for interpolating parameter envelopes, scaled to 1. originally in SuperCollider as durations, not points in time
    structurePoints = [0, 0.14586594177599999, 0.236029032, 0.381924, 0.618, 0.763970968, 1 ];

// generate score
{% include_relative score.js %}

var main = d3.select(".main")
    .attr("height", height)
    .attr("width", width);

// create placeholder barlines
main.append("g")
    .selectAll("line")
    .data(timePoints)
    .enter()
    .append("line")
        .attr("x1", 0)
        .attr("y1", -2 * unit)
        .attr("x2", 0)
        .attr("y2", 3 * unit)
    .style("stroke", "black")
    .style("stroke-opacity", "0.5")
    .attr("transform", function(d) {
        var x = (width * d) / scoreLength,
            y = height * 0.5;
        return "translate(" + x + ", " + y + ")";
    });

main.append("g") // part group
    // for each phrase, create a group around a timePoint
    .selectAll("g")
        .data(timePoints)
        .enter()
        .append("g")
        .attr("transform", function(d, i) {
            var timeDispersion = part[i][0],
                x = ((width * d) / scoreLength) + (VS.getItem([-1,1]) * timeDispersion * unit), // TODO +/- timeDispersion
                y = height * 0.5;
            return "translate(" + x + ", " + y + ")";
        })
    // add phrase content
    .each(function(d, i) {
        var durations = part[i][1];
        d3.select(this).append("text")
            .text(part[i][2] + " [" + part[i][4] + ", " + part[i][3] + "]") // timbre, pitches
            .style("font-family", "monospace")
            .attr("y", -unit);
        d3.select(this).selectAll("rect")
            .data(durations)
            .enter()
            .append("rect")
                .attr("x", function(d, i) {
                    var upToI = durations.slice(0,i);
                    var sum = upToI.reduce(function(a, b) {
                        return a + b + 1; // add padding between here
                    }, 0);

                    return sum * unit;
                })
                .attr("y", function(d, i) { return 0; })
                .attr("width", function(d) { return d * unit; })
                .attr("height", unit)
    });
