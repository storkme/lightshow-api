import { get as gc } from 'config';
export function connect(cb) {
    let ipc = require('node-ipc');
    ipc.config.id = gc('ipc.id');
    ipc.config.retry = gc('ipc.retry');
    ipc.config.maxRetries = gc('ipc.maxRetries');
    ipc.config.silent = true;
    return ipc.connectTo(ipc.config.id, () => cb(ipc.config.id, ipc));
}
//# sourceMappingURL=ipc.js.map