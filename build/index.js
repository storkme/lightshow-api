"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dgram_1 = require("dgram");
var express = require("express");
var config_1 = require("config");
var bouncy_dots_1 = require("./bouncy-dots");
var v_colour_1 = require("./colours/v-colour");
var vr_colour_1 = require("./colours/vr-colour");
var wave_set_1 = require("./wave-set");
var wave_1 = require("./wave");
var ws281x = require('rpi-ws281x-native');
var numLeds = config_1.get('strip.numLeds');
var serverPort = config_1.get('server.port');
var app = express();
var bounce = new bouncy_dots_1.BouncyDots(numLeds, function (buf) { return ws281x.render(buf); });
var existingTimer = null;
var server = dgram_1.createSocket('udp4');
var channel = ws281x.init({
    dma: 10,
    freq: 800000,
    channels: [
        { count: numLeds, gpio: 18, invert: false, brightness: 255, stripType: 'sk6812-rbgw' }
    ]
})[0];
server.on('error', function (err) {
    console.log("server error:\n" + err.stack);
    server.close();
});
server.on('message', function (msg, rinfo) {
    var id = msg.readUInt8(0);
    var err = function () {
        console.error('no handler for msg id: ' + id);
    };
    if (existingTimer) {
        clearTimeout(existingTimer);
        existingTimer = null;
    }
    (({
        100: function () {
            var brightness = msg.readUInt8(1);
            channel.brightness = brightness;
            ws281x.render();
        },
        101: function () {
            var color = msg.readUInt32BE(1);
            bounce.stop();
            channel.array.fill(color);
            ws281x.render();
        },
        102: function () {
            var color = msg.readUInt32BE(1);
            var position = msg.readUInt16BE(5);
            var size = msg.readUInt8(7);
            var r = new Uint32Array(numLeds).fill(0x00);
            for (var i = position - size; i <= position + size; i++) {
                if (i >= 0 && i < r.length) {
                    r[i] = color;
                }
            }
            render(r);
        },
        103: function () {
            bounce.start();
        },
        104: function () {
            bounce.stop();
        },
        105: function () {
            var color = msg.readUInt32BE(1);
            var x = msg.readUInt16BE(5);
            var v = msg.readFloatBE(7);
            var size = msg.readUInt8(11);
            bounce.dots.push({ color: color, x: x, v: v, size: size });
            bounce.start();
        },
        106: function () {
            bounce.dots = [];
            bounce.stop();
        },
        114: function () {
            var vcolor = v_colour_1.VColour.fromHex(msg, 1);
            console.log("In 114 with colour ", vcolor);
            bounce.stop();
            var intcolour;
            intcolour = vcolor.toInt();
            existingTimer = setInterval(function () {
                channel.array.fill(intcolour);
                ws281x.render();
                intcolour = vcolor.next().toInt();
            }, 1000);
        },
        115: function () {
            var vcolor = vr_colour_1.VRColour.fromHex(msg, 1);
            var vcolor2 = vr_colour_1.VRColour.fromHex(msg, 5);
            var vcolor3 = vr_colour_1.VRColour.fromHex(msg, 9);
            var vcolor4 = vr_colour_1.VRColour.fromHex(msg, 13);
            console.log("test the inheritance this should be a VR colour ", vcolor);
            console.log("115 received ", vcolor, vcolor2, vcolor3);
            bounce.stop();
            var waves = new wave_set_1.WaveSet(vcolor, numLeds, true);
            waves.addWave(new wave_1.Wave(vcolor2.diff(vcolor), 20, 30, 7, 0, 30, 20));
            waves.addWave(new wave_1.Wave(vcolor3.diff(vcolor), 10, 20, -12, 15, 20, 10));
            var ww = new wave_1.Wave(vcolor4.diff(vcolor), 100, 200, 3, 5, 200, 10);
            ww.id = "swell";
            waves.addWave(ww);
            var time = 0;
            var timestep = 100;
            existingTimer = setInterval(function () {
                time += timestep / 1000;
                waves.render(channel, time);
                ws281x.render();
            }, timestep);
        },
        120: function () {
            console.log('responding to state query from ' + rinfo.address);
            var buffer = Buffer.allocUnsafe(6);
            buffer.writeInt8(120, 0);
            buffer.writeUInt8(state.brightness, 1);
            buffer.writeUInt32BE(state.buf[0], 2);
            console.log('  writing color: ' + state.buf[0]);
            console.log('  writing buffer as ' + buffer.toString('hex'));
            server.send(buffer, 43594, rinfo.address);
        }
    })[id] || err)();
});
server.on('listening', function () {
    var _a = server.address(), address = _a.address, port = _a.port;
    console.log("UDP server listening on " + address + ":" + port);
});
server.bind(43594);
var state = {
    brightness: 0,
    buf: new Uint32Array(numLeds).fill(0)
};
app.use(function (_, __, next) {
    clearTimeout(existingTimer);
    next();
});
app.use(function (req, res, next) {
    if (req.header('content-type') === 'application/octet-stream' && parseInt(req.header('content-length')) === numLeds * 4) {
        var buf_1 = Buffer.alloc(numLeds * 4);
        var off_1 = 0;
        req.on('data', function (chunk) {
            buf_1.fill(chunk, off_1, chunk.length);
            off_1 += chunk.length;
        });
        req.on('end', function () {
            req.body = buf_1;
            next();
        });
    }
    else {
        next();
    }
});
function buf(color) {
    return new Uint32Array(numLeds).fill(color);
}
function render(buf) {
    state.buf = buf;
    ws281x.render(buf);
}
function setBrightness(bval) {
    if (bval > 255 || bval < 0) {
        throw new Error('Brightness must be between 0-255');
    }
    state.brightness = bval;
    ws281x.setBrightness(state.brightness);
}
//# sourceMappingURL=index.js.map