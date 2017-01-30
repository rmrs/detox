import log = require('npmlog');
import WebSocket = require('ws');

let _detoxConfig;
let _ws;
const _invokeQueue : any[] = [];
let _readyForInvokeId = 0;
let _finishOnInvokeId;
let _onTestResult;
let _onNextAction = {};

export function sendAction(type, params?) {
  const json = JSON.stringify({
    type: type,
    params: params
  }) + '\n ';
  _ws.send(json);
}

export function config(params) {
  _detoxConfig = params;
}

export function connect(onConnect) {
  _ws = new WebSocket(_detoxConfig.server);
  _ws.on('open', () => {
    sendAction('login', {
      sessionId: _detoxConfig.sessionId,
      role: 'tester'
    });
    onConnect();
  });
  _ws.on('message', (str) => {
    const action = JSON.parse(str);
    if (!action.type) {
      return;
    }
    handleAction(action.type, action.params);
  });
}

export function cleanup(onComplete) {
  waitForNextAction('cleanupDone', onComplete);
  if (_ws.readyState === WebSocket.OPEN) {
    sendAction('cleanup');
  } else {
    onComplete();
  }
}

// if there's an error thrown, close the websocket,
// if not, mocha will continue running until reaches timeout.
process.on('uncaughtException', (err) => {
  if (_ws) {
    _ws.close();
  }
  //log.errorerr);
  throw err;
});

process.on('unhandledRejection', function(reason, p) {
  if (_ws) {
    _ws.close();
  }
  //log.error('DETOX', `Unhandled Promise Rejection: ${reason}`);
  //process.exit(1);
  throw reason;
});

export function execute(invocation) {
  if (typeof invocation === 'function') {
    invocation = invocation();
  }
  const id = _invokeQueue.length;
  invocation.id = id.toString();
  _invokeQueue.push(invocation);
  if (_readyForInvokeId >= id) {
    sendAction('invoke', invocation);
  }
}

export function waitForTestResult(done) {
  _finishOnInvokeId = _invokeQueue.length;
  _onTestResult = done;
}

export function waitForNextAction(type, done) {
  _onNextAction[type] = done;
}

export function handleAction(type, params) {
  if (typeof _onNextAction[type] === 'function') {
    _onNextAction[type]();
    _onNextAction[type] = undefined;
  }
  if (type === 'testFailed') {
    // log.info('DETOX: Test Failed:\n%s', params.details);
    if (typeof _onTestResult === 'function') {
      _onTestResult(new Error(params.details));
      _onTestResult = undefined;
    } else {
      log.error('_onTestResult is undefined on testFailed');
    }
  }
  if (type === 'error') {
    log.error('%s', params.error);
  }
  if (type === 'invokeResult') {
    // info.info('DETOX: invokeResult: %s %s', params.id, params.result);
    _readyForInvokeId++;
    if (_invokeQueue[_readyForInvokeId]) {
      sendAction('invoke', _invokeQueue[_readyForInvokeId]);
    }
    if (_finishOnInvokeId === _readyForInvokeId) {
      // log.info('DETOX: Test Passed');
      if (typeof _onTestResult === 'function') {
        _onTestResult();
        _onTestResult = undefined;
      } else {
        log.error('_onTestResult is undefined on test passed');
      }
    }
  }
}