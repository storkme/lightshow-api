"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var https_1 = require("https");
var fs_1 = require("fs");
var express = require("express");
var config_1 = require("config");
var colors_1 = require("./colors");
var ws281x = require('rpi-sk6812-native');
var numLeds = config_1.get('strip.numLeds');
var serverPort = config_1.get('server.port');
var app = express();
var state = {
    brightness: 0,
    buf: new Uint32Array(numLeds).fill(0)
};
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
ws281x.init(numLeds, {
    strip_type: ws281x.STRIP_TYPES.WS2811_STRIP_GRB
});
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
    if (bval > 255 || bval < 0) {
        throw new Error('Brightness must be between 0-255');
    }
    state.brightness = bval;
    ws281x.setBrightness(state.brightness);
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
    var blobAt = function (x, i) {
        var r = new Uint32Array(numLeds).fill(0x00);
        for (var j = x - i; j < x + i; j++) {
            r[j] = 0xffffff;
        }
        return r;
    };
    var n = 0;
    var fn = function () { return setTimeout(function () {
        render(blobAt(n++, 5));
        if (n < 200)
            fn();
    }, 1000 / 30); };
    fn();
    res.status(200).send({});
});
app.get('/clear', function (req, res) {
    render(buf(0));
    res.status(200).send({});
});
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
function buf(color) {
    return new Uint32Array(numLeds).fill(color);
}
function render(buf) {
    state.buf = buf;
    ws281x.render(buf);
}
//# sourceMappingURL=index.js.map