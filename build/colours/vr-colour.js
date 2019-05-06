"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var v_colour_1 = require("./v-colour");
var VRColour = (function (_super) {
    __extends(VRColour, _super);
    function VRColour() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VRColour.prototype.toInt = function () {
        var res = 0;
        for (var k = 0; k < 4; k++) {
            if (this.val[k] <= 0.5)
                res = res * 256;
            else {
                if (this.val[k] > 254.5)
                    res = res * 256 + 255;
                else
                    res = res * 256 + Math.round(this.val[k]);
            }
        }
        return res;
    };
    VRColour.prototype.clone = function () {
        var res = [];
        for (var k = 0; k < 4; k++)
            res.push(this.val[k]);
        return new VRColour(res);
    };
    return VRColour;
}(v_colour_1.VColour));
exports.VRColour = VRColour;
//# sourceMappingURL=vr-colour.js.map