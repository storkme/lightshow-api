"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var https_1 = require("https");
var fs_1 = require("fs");
var dgram_1 = require("dgram");
var express = require("express");
var config_1 = require("config");
var colors_1 = require("./colors");
var bouncy_dots_1 = require("./bouncy-dots");
var ws281x = require('rpi-ws281x-native');
var numLeds = config_1.get('strip.numLeds');
var serverPort = config_1.get('server.port');
var app = express();
var bounce = new bouncy_dots_1.BouncyDots(numLeds, function (buf) { return ws281x.render(buf); });
var existingTimer;
var server = dgram_1.createSocket('udp4');
server.on('error', function (err) {
    console.log("server error:\n" + err.stack);
    server.close();
});
server.on('message', function (msg, rinfo) {
    var id = msg.readUInt8(0);
    var err = function () {
        console.error('no handler for msg id: ' + id);
    };
    (({
        100: function () {
            var brightness = msg.readUInt8(1);
            console.log('setting brightness to: ' + brightness);
            setBrightness(brightness);
        },
        101: function () {
            var color = msg.readUInt32BE(1);
            bounce.stop();
            render(buf(color));
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
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    next();
});
ws281x.init(numLeds, {});
app.get('/solid/html/:color', function (req, res) {
    var color = req.params.color;
    var htmlColorValue = colors_1.htmlColor(color);
    if (htmlColorValue !== -1) {
        var arr = buf(htmlColorValue);
        render(arr);
        res.status(200).send({});
    }
    else {
        throw new Error('idk that color m8');
    }
});
app.get('/solid/hex/:color', function (req, res) {
    var color = req.params.color;
    var colorValue = Math.max(parseInt(color, 16), 0xffffff);
    render(buf(colorValue));
    res.status(200).send({});
});
app.get('/brightness/:brightness', function (req, res) {
    var brightness = req.params.brightness;
    var bval = parseInt(brightness);
    setBrightness(bval);
    res.status(200).send({ brightness: state.brightness });
});
app.get('/brightness', function (req, res) {
    res.status(200).send({ brightness: state.brightness });
});
app.post('/img', function (req, res) {
    var arr = new Uint32Array(req.body.buffer, 0, numLeds);
    render(arr);
    res.status(200).send({});
});
app.get('/img', function (req, res) {
    var response = Buffer.from(state.buf.buffer);
    res.type('application/octet-stream');
    res.status(200).send(response);
});
app.get('/bounce', function (req, res) {
    var numParticles = (req.query.r ? parseInt(req.query.r) : 30) || 30;
    var v = (req.query.v ? parseInt(req.query.v) : 1);
    var _a = [req.query.c1 || 0x0000ff, req.query.c2 || 0xff0000], c1 = _a[0], c2 = _a[1];
    var step = function (pList) {
        pList.forEach(function (particle) {
            var newX = particle.x + particle.v;
            if (newX < 0 || newX > numLeds - 1) {
                particle.v = -particle.v;
                newX = particle.x + particle.v;
            }
            particle.x = newX;
        });
    };
    var toBuf = function (pList) {
        var r = new Uint32Array(numLeds).fill(0x00);
        pList.forEach(function (_a) {
            var x = _a.x, color = _a.color;
            r[x] = r[x] | color;
        });
        return r;
    };
    var particles = [];
    for (var i = 0; i < numParticles; i++) {
        particles.push({ x: i, v: v, color: c1 });
        particles.push({ x: numLeds - i, v: -v, color: c2 });
    }
    var fn = function () {
        existingTimer = setTimeout(function () {
            render(toBuf(particles));
            step(particles);
            fn();
        }, 1000 / 60);
    };
    fn();
    res.status(200).send({});
});
app.get('/clear', function (req, res) {
    render(buf(0));
    res.status(200).send({});
});
if (config_1.get('server.enable')) {
    if (config_1.get('server.secure')) {
        https_1.createServer({
            key: fs_1.readFileSync(config_1.get('server.ssl.key')),
            cert: fs_1.readFileSync(config_1.get('server.ssl.cert')),
            requestCert: true,
            rejectUnauthorized: true,
            ca: [fs_1.readFileSync(config_1.get('server.ssl.ca'))]
        }, app).listen(serverPort);
    }
    else {
        app.listen(serverPort, function () {
            console.log('http server listening on ' + serverPort);
        });
    }
}
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