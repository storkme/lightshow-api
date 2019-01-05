"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hue_walker_1 = require("./colours/hue-walker");
var WaveSet = (function () {
    function WaveSet(background, numLeds, changeBackground) {
        if (changeBackground === void 0) { changeBackground = false; }
        this.lastHueChange = 0;
        this.background = background;
        this.numLeds = numLeds;
        this.changeBackground = changeBackground;
        this.waves = [];
        this.walker = this.changeBackground ? new hue_walker_1.HueWalker(this.background) : null;
    }
    WaveSet.prototype.addWave = function (w) {
        this.waves.push(w);
        var idnum = this.waves.length - 1;
        if (this.waves[idnum].id == "w")
            this.waves[idnum].id = "w" + idnum;
        this.waves[idnum].numLeds = this.numLeds;
        this.waves[idnum].show();
    };
    WaveSet.prototype.render = function (chan, time) {
        var buf = [];
        if (this.changeBackground && time - 2 > this.lastHueChange) {
            this.background = this.walker.next();
            this.lastHueChange = time;
        }
        for (var k = 0; k < this.numLeds; k++)
            buf.push(this.background.clone());
        console.log("WaveSet Type of cloned background colour ", buf[0]);
        for (k = 0; k < this.waves.length; k++)
            this.waves[k].add(time, buf);
        for (k = 0; k < this.numLeds; k++) {
            chan.array[k] = buf[k].toInt();
        }
    };
    return WaveSet;
}());
exports.WaveSet = WaveSet;
//# sourceMappingURL=wave-set.js.map