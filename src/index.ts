import { createSocket } from 'dgram';
import * as express from 'express';
import { get as gc } from 'config';
import { BouncyDots } from './bouncy-dots';
import { VColour } from './colours/v-colour';
import { VRColour } from './colours/vr-colour';
//import { HueWalker } from './colours/hue-walker';
import { WaveSet } from './wave-set';
import { Wave } from './wave';

let ws281x = require('rpi-ws281x-native');

let numLeds = <number> gc('strip.numLeds');
let serverPort = <number> gc('server.port');
let app = express();
const bounce = new BouncyDots(numLeds, (buf) => ws281x.render(buf));

let existingTimer;

const server = createSocket('udp4');
const [channel] = ws281x.init({
  dma: 10,
  freq: 800000,
  channels: [
    { count: numLeds, gpio: 18, invert: false, brightness: 255, stripType: 'sk6812-rbgw' }
  ]
});

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg: Buffer, rinfo) => {
  // console.log('got msg: ' + msg.toString('hex'));
  const id = msg.readUInt8(0);
  const err = () => {
    console.error('no handler for msg id: ' + id);
  };

  (({
    100: () => {
      const brightness = msg.readUInt8(1);
      // setBrightness(brightness);
      channel.brightness = brightness;
      ws281x.render();
    },
    101: () => {
      const color = msg.readUInt32BE(1);
      bounce.stop();
      // console.log('setting color: ' + color);
      // render(buf(color));
      channel.array.fill(color);
      ws281x.render();
    },
    102: () => {
      // point
      const color = msg.readUInt32BE(1);
      const position = msg.readUInt16BE(5);
      const size = msg.readUInt8(7);
      const r = new Uint32Array(numLeds).fill(0x00);
      for (let i = position - size; i <= position + size; i++) {
        if (i >= 0 && i < r.length) {
          r[i] = color;
        }
      }
      render(r);
    },
    103: () => {
      // start bouncing
      bounce.start();
    },
    104: () => {
      // stop bouncing
      bounce.stop();
    },
    105: () => {
      // add point
      const color = msg.readUInt32BE(1);
      const x = msg.readUInt16BE(5);
      const v = msg.readFloatBE(7);
      const size = msg.readUInt8(11);
      bounce.dots.push({ color, x, v, size });
      bounce.start();
    },
    106: () => {
      // clear points
      bounce.dots = [];
      bounce.stop();
    },
	114: function () {
	    var vcolor = VColour.fromHex(msg,1);
	    console.log("In 114 with colour ",vcolor);
        bounce.stop();
		var intcolour;
		
	    //var hw = new HueWalker(vcolor);
		intcolour = vcolor.toInt();
	    //hw.render(channel);

	    existingTimer = setInterval(function(){
			channel.array.fill(intcolour);
            ws281x.render();
			intcolour = vcolor.next().toInt();
	    }, 1000);
    },
	// waves done by cosine
	// current status - works with 2
    115: function () {
	    var vcolor = VRColour.fromHex(msg,1);
	    var vcolor2 = VRColour.fromHex(msg,5);
	    var vcolor3 = VRColour.fromHex(msg,9);
	    var vcolor4 = VRColour.fromHex(msg,13);
	
	    console.log("115 received ",vcolor, vcolor2, vcolor3);
        bounce.stop();
 	    
	    var waves = new WaveSet(vcolor, numLeds, true);
	    // amplitude, wavelength, width, speed, starttime, elife
        waves.addWave(new Wave(vcolor2.diff(vcolor), 20, 30, 7, 0, 30, 20));
		
        waves.addWave(new Wave(vcolor3.diff(vcolor), 10, 20, -12, 15, 20, 10));
		
		let ww = new Wave(vcolor4.diff(vcolor), 	100, 200, 3, 5, 20, 10);
		ww.id = "swell";
        waves.addWave(ww);
		
	    var time = 0;	// in sec
 	    var timestep = 100;	// in msec

	    existingTimer = setInterval(function(){
			time+= timestep/1000;
			waves.render(channel,time);	
            ws281x.render();
		}, timestep);

    },
    120: () => {
      console.log('responding to state query from ' + rinfo.address);
      const buffer = Buffer.allocUnsafe(6);
      buffer.writeInt8(120, 0);
      buffer.writeUInt8(state.brightness, 1);
      buffer.writeUInt32BE(state.buf[0], 2);

      console.log('  writing color: ' + state.buf[0]);
      console.log('  writing buffer as ' + buffer.toString('hex'));

      server.send(buffer, 43594, rinfo.address);
    }
  })[id] || err)();

});

server.on('listening', () => {
  const { address, port } = server.address() as any;
  console.log(`UDP server listening on ${address}:${port}`);
});

server.bind(43594);

const state = {
  brightness: 0,
  buf: new Uint32Array(numLeds).fill(0)
};

// reset any timers we have going on
app.use((_, __, next) => {
  clearTimeout(existingTimer);
  next();
});

// janky custom middlewhere for reading led buffers !!
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

// app.use((req, res, next) => {
//   // lazy man's CORS !
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
//   next();
// });

// app.get('/solid/html/:color', (req, res) => {
//   let { color } = req.params;
//   let htmlColorValue = htmlColor(color);
//   if (htmlColorValue !== -1) {
//     let arr = buf(htmlColorValue);
//     render(arr);
//     res.status(200).send({});
//   } else {
//     throw new Error('idk that color m8');
//   }
// });
//
// app.get('/solid/hex/:color', (req, res) => {
//   let { color } = req.params;
//   let colorValue = Math.max(parseInt(color, 16), 0xffffff);
//   render(buf(colorValue));
//   res.status(200).send({});
// });
//
// app.get('/brightness/:brightness', (req, res) => {
//   let { brightness } = req.params;
//   let bval = parseInt(brightness);
//   setBrightness(bval);
//
//   res.status(200).send({ brightness: state.brightness });
// });
//
// app.get('/brightness', (req, res) => {
//   res.status(200).send({ brightness: state.brightness });
// });
//
// app.post('/img', (req, res) => {
//   let arr = new Uint32Array(req.body.buffer, 0, numLeds);
//   render(arr);
//   res.status(200).send({});
// });
//
// app.get('/img', (req, res) => {
//   let response = Buffer.from(state.buf.buffer);
//   res.type('application/octet-stream');
//   res.status(200).send(response);
// });
//
// app.get('/bounce', (req, res) => {
//   const numParticles = (req.query.r ? parseInt(req.query.r) : 30) || 30;
//   const v = (req.query.v ? parseInt(req.query.v) : 1);
//   const [c1, c2] = [req.query.c1 || 0x0000ff, req.query.c2 || 0xff0000];
//   const step = (pList) => {
//     pList.forEach((particle) => {
//       let newX = particle.x + particle.v;
//       if (newX < 0 || newX > numLeds - 1) {
//         // change direction
//         particle.v = -particle.v;
//         newX = particle.x + particle.v;
//       }
//       particle.x = newX;
//     });
//   };
//   const toBuf = (pList) => {
//     const r = new Uint32Array(numLeds).fill(0x00);
//     pList.forEach(({ x, color }) => {
//       r[x] = r[x] | color;
//     });
//     return r;
//   };
//
//   const particles = [];
//   for (let i = 0; i < numParticles; i++) {
//     particles.push({ x: i, v, color: c1 });
//     particles.push({ x: numLeds - i, v: -v, color: c2 });
//   }
//
//   let fn = () => {
//     existingTimer = setTimeout(
//       () => {
//         render(toBuf(particles));
//         step(particles);
//         fn();
//       },
//       1000 / 60
//     );
//   };
//
//   fn();
//
//   res.status(200).send({});
// });
//
// app.get('/clear', (req, res) => {
//   render(buf(0));
//   res.status(200).send({});
// });
//
// if (gc('server.enable')) {
//   if (gc('server.secure')) {
//     createServer({
//       key: readFileSync(<string>gc('server.ssl.key')),
//       cert: readFileSync(<string>gc('server.ssl.cert')),
//       requestCert: true,
//       rejectUnauthorized: true,
//       ca: [readFileSync(<string>gc('server.ssl.ca'))]
//     }, app).listen(serverPort);
//   } else {
//     app.listen(serverPort, () => {
//       console.log('http server listening on ' + serverPort);
//     });
//   }
// }

function buf(color) {
  return new Uint32Array(numLeds).fill(color);
}

function render(buf: Uint32Array) {
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
// change these into 2 colour classes
/**
* create a single colour integer from a real colour vector
*/
function colr_obs(vc){
   let intcol = [];
   for (var k=0; k<4; k++){
	if (vc[k]<0.5) intcol.push(0);
	else {
	   if (vc[k]>254.4) intcol.push(255);
	   else intcol.push(Math.round(vc[k]));
	} 
   }
   //console.log("colr change from to ",vc, intcol);
   //return col(intcol);
}
function col_obs(vc){
   return ((Math.round(vc[0])*256+Math.round(vc[1]))*256+Math.round(vc[2]))*256+Math.round(vc[3]);
}
function getVC_obs(msg,pos){
   return [msg.readUInt8(pos),msg.readUInt8(pos+1),msg.readUInt8(pos+2),msg.readUInt8(pos+3)];
}
function cloneVC_obs(a){
   let res = [];
   for (var k=0; k<4; k++) res.push(a[k]);
   return res;
}
function subVC_obs(a,b){
   let res = [];
   for (var k=0; k<4; k++) res.push(a[k]-b[k]);
   return res;
}
function vplus_obs(a,b){
   var res = [];
   for (var k=0; k<4; k++){
	res.push(a[k]+b[k]);
   }
   return res;
}
