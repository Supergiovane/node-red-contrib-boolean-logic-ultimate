'use strict';

module.exports = function (RED) {
  function RateLimiterUltimate(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    const REDUtil = RED.util;
    const helpers = require('./lib/node-helpers.js');

    const {
      mode: initialMode = 'debounce',
      wait = 500,
      emitOn = 'trailing',
      interval = 1000,
      trailing = false,
      windowSize = 1000,
      maxInWindow = 10,
      dropStrategy = 'drop',
      payloadPropName = 'payload',
      translatorConfig,
      controlTopic = 'rate',
      statInterval = 0,
    } = config;

    let currentMode = initialMode;
    let passedCount = 0;
    let droppedCount = 0;
    let currentState = 'idle';

    const setNodeStatus = helpers.createStatus(node);
    const timerBag = helpers.createTimerBag(node);

    const modeLabels = {
      debounce: 'DB',
      throttle: 'TH',
      window: 'WN',
    };

    const stateLabels = {
      idle: 'idle',
      waiting: 'waiting',
      cooldown: 'cooldown',
      blocked: 'blocked',
    };

    function sendStatus() {
      const prefix = modeLabels[currentMode] || currentMode.toUpperCase();
      const state = stateLabels[currentState] || currentState;
      const colour = currentState === 'idle' ? 'green' : currentState === 'waiting' || currentState === 'cooldown' ? 'yellow' : 'red';
      setNodeStatus({
        fill: colour,
        shape: 'dot',
        text: `${prefix}|${state} pass:${passedCount} drop:${droppedCount}`,
      });
    }

    function emitToOutputs(msg, droppedMeta) {
      const outputs = [msg, null];
      if (droppedMeta) {
        outputs[0] = null;
        outputs[1] = droppedMeta;
      }
      node.send(outputs);
      sendStatus();
    }

    function clone(msg) {
      return REDUtil.cloneMessage ? REDUtil.cloneMessage(msg) : JSON.parse(JSON.stringify(msg));
    }

    function emitForward(msg, nextState = 'idle') {
      passedCount += 1;
      currentState = nextState;
      emitToOutputs(msg, null);
    }

    function emitDrop(reason, originalMsg, resolved) {
      droppedCount += 1;
      const dropState = {
        'dropped-window': 'blocked',
        'suppressed-debounce': 'cooldown',
        'dropped-throttle': 'cooldown',
      }[reason] || 'blocked';
      currentState = dropState;
      emitToOutputs(null, {
        topic: `${controlTopic}/drop`,
        payload: {
          mode: currentMode,
          reason,
          msg: originalMsg,
          passed: passedCount,
          dropped: droppedCount,
          property: payloadPropName,
          propertyValue: resolved ? resolved.value : undefined,
          propertyBoolean: resolved ? resolved.boolean : undefined,
        },
      });
    }

    let debounceTimer = null;
    let debounceLeadingSent = false;
    let pendingDebounceMessage = null;

    let throttleTimer = null;
    let throttleLastEmit = 0;
    let throttlePendingMessage = null;

    let windowTimestamps = [];
    let windowQueueMessage = null;
    let windowQueueTimer = null;

    function clearDebounce() {
      if (debounceTimer) {
        timerBag.clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      debounceLeadingSent = false;
      pendingDebounceMessage = null;
    }

    function clearThrottle() {
      if (throttleTimer) {
        timerBag.clearTimeout(throttleTimer);
        throttleTimer = null;
      }
      throttlePendingMessage = null;
    }

    function clearWindowQueue() {
      if (windowQueueTimer) {
        timerBag.clearTimeout(windowQueueTimer);
        windowQueueTimer = null;
      }
      windowQueueMessage = null;
    }

    function resetAll() {
      clearDebounce();
      clearThrottle();
      clearWindowQueue();
      windowTimestamps = [];
      throttleLastEmit = 0;
      currentState = 'idle';
      sendStatus();
    }

    function flushPending() {
      switch (currentMode) {
        case 'debounce':
          if (pendingDebounceMessage) {
            const toSend = pendingDebounceMessage;
            clearDebounce();
            emitForward(toSend);
          }
          break;
        case 'throttle':
          if (throttlePendingMessage) {
            const toSend = throttlePendingMessage;
            throttlePendingMessage = null;
            throttleLastEmit = Date.now();
            emitForward(toSend);
            if (throttleTimer) {
              timerBag.clearTimeout(throttleTimer);
              throttleTimer = null;
            }
          }
          break;
        case 'window':
          if (windowQueueMessage) {
            const queued = windowQueueMessage;
            clearWindowQueue();
            tryEmitWindow(queued.msg, queued.propertyValue);
          }
          break;
        default:
          break;
      }
    }

    function handleControlMessage(msg) {
      let consumed = false;
      if (msg.reset === true) {
        resetAll();
        consumed = true;
      }
      if (msg.flush === true) {
        flushPending();
        consumed = true;
      }
      if (typeof msg.mode === 'string') {
        const newMode = msg.mode.toLowerCase();
        if (['debounce', 'throttle', 'window'].includes(newMode)) {
          currentMode = newMode;
          resetAll();
          consumed = true;
        }
      }
      if (typeof msg.interval === 'number') {
        config.interval = msg.interval;
        consumed = true;
      }
      if (typeof msg.wait === 'number') {
        config.wait = msg.wait;
        consumed = true;
      }
      if (typeof msg.windowSize === 'number') {
        config.windowSize = msg.windowSize;
        consumed = true;
      }
      if (typeof msg.maxInWindow === 'number') {
        config.maxInWindow = msg.maxInWindow;
        consumed = true;
      }
      return consumed;
    }

    function scheduleStats() {
      if (Number(statInterval) > 0) {
        timerBag.setInterval(() => {
          node.send([
            null,
            {
              topic: `${controlTopic}/stats`,
              payload: {
                mode: currentMode,
                state: currentState,
                passed: passedCount,
                dropped: droppedCount,
              },
            },
          ]);
        }, Number(statInterval) * 1000);
      }
    }

    function tryEmitWindow(msg, resolved) {
      const now = Date.now();
      const size = Number(config.windowSize || windowSize);
      const max = Number(config.maxInWindow || maxInWindow);

      windowTimestamps = windowTimestamps.filter((ts) => now - ts <= size);
      if (windowTimestamps.length < max) {
        const hadQueue = Boolean(windowQueueMessage);
        emitForward(msg, hadQueue ? 'waiting' : 'idle');
        windowTimestamps.push(now);
        if (windowQueueMessage && !windowQueueTimer) {
          const queued = windowQueueMessage;
          windowQueueMessage = null;
          const delay = size - (now - windowTimestamps[0]);
          windowQueueTimer = timerBag.setTimeout(() => {
            windowQueueTimer = null;
            tryEmitWindow(queued.msg, queued.resolved);
          }, Math.max(delay, 0));
        }
        return true;
      }

      if ((config.dropStrategy || dropStrategy) === 'queue') {
        windowQueueMessage = { msg, resolved };
        currentState = 'blocked';
        if (!windowQueueTimer) {
          const delay = size - (now - windowTimestamps[0]);
          windowQueueTimer = timerBag.setTimeout(() => {
            windowQueueTimer = null;
            if (windowQueueMessage) {
              const queued = windowQueueMessage;
              windowQueueMessage = null;
              tryEmitWindow(queued.msg, queued.resolved);
            }
          }, Math.max(delay, 0));
        }
      } else {
        emitDrop('dropped-window', msg, resolved);
      }
      return false;
    }

    function handleDebounce(msg, resolved) {
      const waitTime = Number(config.wait || wait);
      const emitSetting = config.emitOn || emitOn;
      const cloned = clone(msg);

      if (debounceTimer) {
        timerBag.clearTimeout(debounceTimer);
        debounceTimer = null;
      }

      pendingDebounceMessage = cloned;
      currentState = 'waiting';

      const shouldEmitLeading = (emitSetting === 'leading' || emitSetting === 'both') && !debounceLeadingSent;
      if (shouldEmitLeading) {
        emitForward(cloned, 'waiting');
        debounceLeadingSent = true;
      }

      if (emitSetting === 'leading' && !shouldEmitLeading) {
        emitDrop('suppressed-debounce', cloned, resolved);
        return;
      }

      debounceTimer = timerBag.setTimeout(() => {
        debounceTimer = null;
        debounceLeadingSent = false;
        const shouldEmitTrailing = emitSetting === 'trailing' || emitSetting === 'both';
        if (shouldEmitTrailing && pendingDebounceMessage) {
          const toSend = pendingDebounceMessage;
          pendingDebounceMessage = null;
          emitForward(toSend, 'idle');
        } else {
          pendingDebounceMessage = null;
          currentState = 'idle';
          sendStatus();
        }
      }, waitTime);
    }

    function handleThrottle(msg, resolved) {
      const intervalMs = Number(config.interval || interval);
      const trailingEnabled = Boolean(config.trailing ?? trailing);
      const now = Date.now();
      const cloned = clone(msg);

      if (now - throttleLastEmit >= intervalMs) {
        throttleLastEmit = now;
        emitForward(cloned);
        clearThrottle();
        return;
      }

      if (!trailingEnabled) {
        emitDrop('dropped-throttle', cloned, resolved);
        return;
      }

      throttlePendingMessage = cloned;
      currentState = 'cooldown';
      if (!throttleTimer) {
        const delay = intervalMs - (now - throttleLastEmit);
        throttleTimer = timerBag.setTimeout(() => {
          throttleTimer = null;
          if (throttlePendingMessage) {
            throttleLastEmit = Date.now();
            const toSend = throttlePendingMessage;
            throttlePendingMessage = null;
            emitForward(toSend);
          } else {
            currentState = 'idle';
            sendStatus();
          }
        }, delay);
      }
    }

    function handleWindow(msg, resolved) {
      const cloned = clone(msg);
      if (!tryEmitWindow(cloned, resolved)) {
        if ((config.dropStrategy || dropStrategy) !== 'queue') {
          // Drop already emitted; ensure status reflects blocked state
          currentState = 'blocked';
          sendStatus();
        }
      }
    }

    node.on('input', function (msg) {
      if (msg.topic === controlTopic) {
        if (handleControlMessage(msg)) {
          return;
        }
      }

      const resolved = helpers.resolveInput(msg, payloadPropName, config.translatorConfig, RED);

      switch (currentMode) {
        case 'debounce':
          handleDebounce(msg, resolved);
          break;
        case 'throttle':
          handleThrottle(msg, resolved);
          break;
        case 'window':
          handleWindow(msg, resolved);
          break;
        default:
          emitForward(clone(msg));
          break;
      }
    });

    scheduleStats();
    sendStatus();
  }

  RED.nodes.registerType('RateLimiterUltimate', RateLimiterUltimate);
};
