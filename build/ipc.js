"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("config");
function connect(cb) {
    var ipc = require('node-ipc');
    ipc.config.id = config_1.get('ipc.id');
    ipc.config.retry = config_1.get('ipc.retry');
    ipc.config.maxRetries = config_1.get('ipc.maxRetries');
    ipc.config.silent = true;
    return ipc.connectTo(ipc.config.id, function () { return cb(ipc.config.id, ipc); });
}
exports.connect = connect;
//# sourceMappingURL=ipc.js.map