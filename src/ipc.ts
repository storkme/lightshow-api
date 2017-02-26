import {get as gc} from 'config';


export function connect(cb: (id: string, ipc: any) => void) {
  let ipc: any = require('node-ipc');
  ipc.config.id = gc('ipc.id');
  ipc.config.retry = gc('ipc.retry');
  ipc.config.maxRetries = gc('ipc.maxRetries');
  ipc.config.silent = true;

  return ipc.connectTo(ipc.config.id, () => cb(ipc.config.id, ipc));
}


