import log = require('npmlog');
import * as websocket from './websocket';
import  { Simulator } from './devices/simulator';
import * as expect from './ios/expect';
import * as argparse from './utils/argparse';

const loglevel = argparse.getArgValue('verbose') ? 'verbose' : 'info';
log.level = loglevel;
log.heading = 'detox';

let _detoxConfig = {
  session: {
    server: 'ws://localhost:8099',
    sessionId: 'example'
  }
};

export function config(detoxConfig) {
  _detoxConfig = detoxConfig;
}

export async function start(onStart) {
  expect.exportGlobals();
  const simulator = new Simulator();
  global['simulator'] = simulator;

  websocket.config(_detoxConfig.session);
  websocket.connect(async() => {
    const target = argparse.getArgValue('target') || 'ios-sim';
    if (target === 'ios-sim') {
      await simulator.prepare(_detoxConfig, onStart);
    } else {
      onStart();
    }
  });
}

export async function openURL(url, onComplete) {
  const target = argparse.getArgValue('target') || 'ios-sim';
  if (target === 'ios-sim') {
    await global['simulator'].openURL(url);
  }
  onComplete();
}

export function cleanup(onComplete) {
  websocket.cleanup(onComplete);
}

export function waitForTestResult(done) {
  websocket.waitForTestResult(done);
}
