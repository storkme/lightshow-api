"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Wave = (function () {
    function Wave(amplitude, numLeds, wavelength, width, speed, starttime, elife, restarttime) {
        this.amplitude = amplitude;
        this.numLeds = numLeds;
        this.w2 = width * width;
        this.speed = speed;
        this.starttime = starttime;
        this.wavelength = wavelength;
        this.lam = 2 * Math.PI / wavelength;
        this.elife = elife;
        this.restartProb = 1 / restarttime;
        this.dead = false;
        this.pending = true;
        this.id = "w";
        console.log("Wave: --- amp=", amplitude);
    }
    Wave.prototype.val = function (x, t) {
        if (t < this.starttime) {
            this.dead = false;
            return [0, 0, 0, 0];
        }
        var tt = t - this.starttime;
        if (tt == 0)
            console.log("Wave " + this.id + " starting");
        this.pending = false;
        var pos = x - tt * this.speed;
        if (this.speed < 0)
            pos = this.numLeds - pos;
        var decay = Math.exp(-tt / this.elife);
        this.checkForDead(tt, pos);
        var y = Math.cos(pos * this.lam) * Math.exp(-pos * pos / this.w2) * decay;
        var res = [];
        for (var k = 0; k < 4; k++)
            res.push(y * this.amplitude[k]);
        return res;
    };
    Wave.prototype.add = function (time, buf) {
        if (this.dead) {
            var r = Math.random();
            if (r < this.restartProb)
                this.reset(time);
            else
                return;
        }
        var x, y;
        this.dead = true;
        for (x = 0; x < buf.length; x++) {
            y = this.val(x, time);
            for (var k = 0; k < 4; k++) {
                buf[x].val[k] += y[k];
            }
        }
    };
    Wave.prototype.reset = function (time) {
        console.log("restarting " + this.id + " at time " + time);
        this.dead = false;
        this.starttime = time;
    };
    Wave.prototype.checkForDead = function (tt, pos) {
        if (tt < this.elife * 3)
            this.dead = false;
        if (pos * pos < this.w2 * 3)
            this.dead = false;
    };
    return Wave;
}());
exports.Wave = Wave;
//# sourceMappingURL=wave.js.map