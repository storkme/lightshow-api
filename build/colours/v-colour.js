"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hue_walker_1 = require("./hue-walker");
var VColour = (function () {
    function VColour(value) {
        if (value === void 0) { value = [0, 0, 0, 0]; }
        this.walker = null;
        this.val = value;
    }
    VColour.fromHex = function (msg, pos) {
        var cthis = this.childClass();
        console.log("Test the inheritance ", cthis, this);
        return new this([msg.readUInt8(pos), msg.readUInt8(pos + 1), msg.readUInt8(pos + 2), msg.readUInt8(pos + 3)]);
    };
    VColour.cloneX = function (a) {
        var cthis = this.childClass();
        return new this([a.val[0], a.val[1], a.val[2], a.val[3]]);
    };
    VColour.childClass = function () {
        return this;
    };
    VColour.prototype.clone = function () {
        var res = [];
        for (var k = 0; k < 4; k++)
            res.push(this.val[k]);
        return new VColour(res);
    };
    VColour.prototype.add = function (a) {
        for (var k = 0; k < 4; k++)
            this.val[k] += a.val[k];
    };
    VColour.prototype.next = function () {
        if (!this.walker)
            this.walker = new hue_walker_1.HueWalker(this);
        var x = this.walker.next();
        this.val = x.val;
        return this;
    };
    VColour.prototype.sub = function (a) {
        for (var k = 0; k < 4; k++)
            this.val[k] -= a.val[k];
    };
    VColour.prototype.diff = function (a) {
        var res = [];
        for (var k = 0; k < 4; k++)
            res.push(this.val[k] - a.val[k]);
        return res;
    };
    VColour.prototype.addA = function (a) {
        for (var k = 0; k < 4; k++)
            this.val[k] += a[k];
    };
    VColour.prototype.subA = function (a) {
        for (var k = 0; k < 4; k++)
            this.val[k] -= a[k];
    };
    VColour.prototype.toInt = function () {
        var vc = this.val;
        var res = ((Math.round(vc[0]) * 256 + Math.round(vc[1])) * 256 + Math.round(vc[2])) * 256 + Math.round(vc[3]);
        console.log("V-colour col() toint", this.val, res);
        return res;
    };
    VColour.prototype.toInt_undo = function () {
        var res = 0;
        for (var k = 0; k < 4; k++) {
            if (this.val[k] <= 0)
                res = res * 256;
            else {
                if (this.val[k] >= 255)
                    res = res * 256 + 255;
                else
                    res = res * 256 + this.val[k];
            }
        }
        console.log("V-colour toint", this.val, res);
        return res;
    };
    VColour.prototype.isWhite = function () {
        return this.val[1] == this.val[2] && this.val[2] == this.val[3];
    };
    VColour.prototype.show = function () {
        console.log("--- col " + this.val[0] + "," + this.val[1] + "," + this.val[2] + "," + this.val[3]);
    };
    return VColour;
}());
exports.VColour = VColour;
//# sourceMappingURL=v-colour.js.map