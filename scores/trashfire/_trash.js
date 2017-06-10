TrashFire.Trash = function(width, height) {
    var trash = {},
        dumpster = TrashFire.dumpster;

    trash.group = dumpster.trash.append("g")
        .attr("transform", "translate(" + dumpster.center.x + ","  + dumpster.center.y + ")");

    trash.width = width;
    trash.height = height;
    trash.center = {
        x: width * 0.5,
        y: height * 0.5
    };

    // TODO methods to add/remove from bins -- as prototype?
    trash.addToBins = function() {
        TrashFire.bins.add(trash);
    };

    trash.makeCircle = function() {
        trash.group.append("circle")
            .attr("cx", trash.center.x)
            .attr("cy", trash.center.y)
            .attr("r", 8);
    };

    return trash;
};
