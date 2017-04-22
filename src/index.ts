import { createServer } from 'https';
import { openSync, readFileSync, writeFileSync, writeSync } from "fs";

import { raw } from 'body-parser';
import * as express from 'express';
import { get as gc } from 'config';

import { htmlColor } from './colors';

let ws281x = require('rpi-sk6812-native');

let numLeds = <number> gc('strip.numLeds');
let serverPort = <number> gc('server.port');
let app = express();

const state = {
  brightness: 0,
  buf: new Uint32Array(numLeds).fill(0)
};


// app.use(raw({
//   limit: numLeds * 4
// }));

app.use((req, res, next) => {
  if (req.header('content-type') === 'application/octet-stream' && parseInt(req.header('content-length')) === numLeds * 4) {
    const buf = Buffer.alloc(numLeds * 4);
    let off = 0;
    req.on('data', (chunk) => {
      buf.fill(chunk, off, chunk.length);
      off += chunk.length;
    });

    req.on('end', function () {
      req.body = buf;
      next();
    });
  } else {
    next();
  }
});

app.use((req, res, next) => {
  // lazy man's CORS !
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  next();
});

ws281x.init(numLeds, {
  strip_type: ws281x.STRIP_TYPES.WS2811_STRIP_GRB
});

app.get('/solid/html/:color', (req, res) => {
  let {color} = req.params;
  let htmlColorValue = htmlColor(color);
  if (htmlColorValue !== -1) {
    let arr = buf(htmlColorValue);
    render(arr);
    res.status(200).send({});
  } else {
    throw new Error('idk that color m8');
  }
});

app.get('/solid/hex/:color', (req, res) => {
  let {color} = req.params;
  let colorValue = Math.max(parseInt(color, 16), 0xffffff);
  render(buf(colorValue));
  res.status(200).send({});
});

app.get('/brightness/:brightness', (req, res) => {
  let {brightness} = req.params;
  let bval = parseInt(brightness);
  if (bval > 255 || bval < 0) {
    throw new Error('Brightness must be between 0-255');
  }
  state.brightness = bval;
  ws281x.setBrightness(state.brightness);

  res.status(200).send({brightness: state.brightness});
});

app.get('/brightness', (req, res) => {
  res.status(200).send({brightness: state.brightness});
});

app.post('/img', (req, res) => {
  let arr = new Uint32Array(req.body.buffer, 0, numLeds);
  render(arr);
  res.status(200).send({});
});

app.get('/img', (req, res) => {
  let response = Buffer.from(state.buf.buffer);
  res.type('application/octet-stream');
  res.status(200).send(response);
});

app.get('/bounce', (req, res) => {
  const blobAt = (x: number, i: number) => {
    const r = new Uint32Array(numLeds).fill(0x00);
    for (let j = x - i; j < x + i; j++) {
      r[j] = 0xffffff;
    }
    return r;
  };

  let n = 0;

  let fn = () => setTimeout(
    () => {
      render(blobAt(n++, 5));
      if (n < 200) fn();
    },
    1000 / 30
  );

  fn();

  res.status(200).send({});
});

app.get('/clear', (req, res) => {
  render(buf(0));
  res.status(200).send({});
});

if (gc('server.secure')) {
  createServer({
    key: readFileSync(<string>gc('server.ssl.key')),
    cert: readFileSync(<string>gc('server.ssl.cert')),
    requestCert: true,
    rejectUnauthorized: true,
    ca: [readFileSync(<string>gc('server.ssl.ca'))]
  }, app).listen(serverPort);
} else {
  app.listen(serverPort, () => {
    console.log('http server listening on ' + serverPort);
  });
}

function buf(color) {
  return new Uint32Array(numLeds).fill(color);
}

function render(buf: Uint32Array) {
  state.buf = buf;
  ws281x.render(buf);
}