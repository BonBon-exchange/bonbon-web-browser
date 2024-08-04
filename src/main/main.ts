/* eslint-disable import/first */
/* eslint-disable global-require */
/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { app } from 'electron';
import { machineIdSync } from 'node-machine-id';
import Nucleus from 'nucleus-analytics';

import './appEvents';
import './logger';
import './chat';

const machineId = machineIdSync();
const appVersion = app.getVersion();

Nucleus.init('62aaf235a3310eb923a238e2');
Nucleus.setUserId(machineId);
Nucleus.setProps(
  {
    app_version: appVersion,
    version: appVersion,
    app_is_packaged: app.isPackaged,
  },
  true
);

if (app.isPackaged) {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}
