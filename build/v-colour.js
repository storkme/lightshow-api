"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VColour = (function () {
    function VColour(value) {
        if (value === void 0) { value = [0, 0, 0, 0]; }
        this.val = value;
    }
    VColour.fromHex = function (msg, pos) {
        return new this([msg.readUInt8(pos), msg.readUInt8(pos + 1), msg.readUInt8(pos + 2), msg.readUInt8(pos + 3)]);
    };
    VColour.clone = function (a) {
        return new this([a[0], a[1], a[2], a[3]]);
    };
    VColour.prototype.add = function (a) {
        for (var k = 0; k < 4; k++)
            this.val[k] += a.val[k];
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