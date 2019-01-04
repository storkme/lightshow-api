"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HueWalker = (function () {
    function HueWalker(initial) {
        this.init = [];
        this.isWhite = false;
        this.steps = 0;
        this.init = initial;
        this.setup();
        this.rangeAndEdge(initial);
    }
    HueWalker.prototype.next = function () {
        if (this.isWhite)
            return this.init;
        for (var k = 0; k < 3; k++) {
            if (this.atEndEdge()) {
                this.edge++;
                if (this.edge > 5)
                    this.edge = 0;
                console.log("Changing to edge " + this.edge + " after " + this.steps + " steps");
            }
            else {
                this.steps++;
                for (var j = 0; j < 4; j++) {
                    this.current[j] = this.current[j] + this.edges[this.edge][j];
                }
                return this.current;
            }
        }
        return this.current;
    };
    HueWalker.prototype.show = function () {
        console.log("HueWalker: whiteness=" + this.lo + " to " + this.hi + ". edge=" + this.edge);
    };
    HueWalker.prototype.setup = function () {
        this.edges = [
            [0, 0, 1, -1],
            [0, -1, 1, 0],
            [0, -1, 0, 1],
            [0, 0, -1, 1],
            [0, 1, -1, 0],
            [0, 1, 0, -1]
        ];
        this.minmax = [
            [3, 2],
            [1, 2],
            [1, 3],
            [2, 3],
            [2, 1],
            [3, 1]
        ];
    };
    HueWalker.prototype.rangeAndEdge = function (init) {
        var k;
        this.current = init;
        if (init[1] == init[2] && init[2] == init[3]) {
            this.isWhite = true;
            return;
        }
        else
            this.isWhite = false;
        var edge = -1;
        var whiteness = 255;
        var extremes = [255 - init[1], init[3], 255 - init[2], init[1], 255 - init[3], init[2]];
        for (k = 0; k < 6; k++) {
            if (extremes[k] < whiteness) {
                whiteness = extremes[k];
                edge = k;
            }
        }
        this.edge = edge;
        this.lo = whiteness;
        this.hi = 255 - whiteness;
    };
    HueWalker.prototype.atEndEdge = function () {
        var mm = this.minmax[this.edge];
        return this.current[mm[0]] <= this.lo || this.current[mm[1]] >= this.hi;
    };
    return HueWalker;
}());
exports.HueWalker = HueWalker;
//# sourceMappingURL=vr-colour.js.map