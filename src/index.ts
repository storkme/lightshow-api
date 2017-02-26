import * as express from 'express';
import {get as gc} from 'config';

import {connect} from './ipc';

let serverPort = gc('server.port')
let app = express();

connect((id, ipc) => {

  app.get('/red', (req, res) => {
    let buf = new Uint32Array(<number> gc('strip.numLeds')).fill(0xff0000);
    ipc.of[id].emit('render', buf);
    res.send(200, {});
  });

  app.listen(serverPort, () => {
    console.log('server listening on ' + serverPort);
  });
});

