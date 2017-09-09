"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BouncyDots = (function () {
    function BouncyDots(numLeds, renderCallback) {
        this.numLeds = numLeds;
        this.renderCallback = renderCallback;
        this.dots = [];
        this.existingTimer = null;
    }
    BouncyDots.prototype.start = function () {
        var _this = this;
        if (this.existingTimer == null) {
            var stepFn_1 = function () {
                return setTimeout(function () {
                    _this.render();
                    _this.step();
                    _this.existingTimer = stepFn_1();
                }, 1000 / 50);
            };
            this.existingTimer = stepFn_1();
        }
    };
    BouncyDots.prototype.stop = function () {
        if (this.existingTimer != null) {
            clearTimeout(this.existingTimer);
            this.existingTimer = null;
        }
    };
    BouncyDots.prototype.step = function () {
        for (var i = 0; i < this.dots.length; i++) {
            var particle = this.dots[i];
            var newX = particle.x + particle.v;
            if (newX < 0 || newX > this.numLeds - 1) {
                particle.v = -particle.v;
                newX = particle.x + particle.v;
            }
            particle.x = newX;
        }
    };
    BouncyDots.prototype.render = function () {
        var buf = new Uint32Array(this.numLeds).fill(0x0);
        for (var i = 0; i < this.dots.length; i++) {
            var particle = this.dots[i];
            var dotCenter = Math.round(particle.x);
            for (var i_1 = dotCenter - particle.size; i_1 <= dotCenter + particle.size; i_1++) {
                if (i_1 > 0 && i_1 < this.numLeds) {
                    buf[i_1] = buf[i_1] | particle.color;
                }
            }
        }
        this.renderCallback(buf);
    };
    return BouncyDots;
}());
exports.BouncyDots = BouncyDots;
//# sourceMappingURL=bouncy-dots.js.map