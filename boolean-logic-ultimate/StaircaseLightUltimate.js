'use strict';

module.exports = function (RED) {
  const helpers = require('./lib/node-helpers.js');

  function StaircaseLightUltimate(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    const REDUtil = RED.util;

    const setNodeStatus = helpers.createStatus(node);
    const timerBag = helpers.createTimerBag(node);

    const controlTopic = config.controlTopic || 'stairs';
    const payloadPropName = config.payloadPropName || 'payload';

    let translatorConfig = null;
    if (config.translatorConfig) {
      translatorConfig = RED.nodes.getNode(config.translatorConfig);
    }

    let durationMs = toMilliseconds(config.durationSeconds, 30);
    let warningEnabled = Boolean(config.warningEnabled);
    let warningOffsetMs = toMilliseconds(config.warningOffsetSeconds, 5);
    const restartOnTrigger = config.restartOnTrigger !== false; // default true

    let active = false;
    let lightTimer = null;
    let warningTimer = null;
    let statusInterval = null;
    let expiresAt = 0;
    let lastTriggerMsg = null;
    let cycleCount = 0;

    function toMilliseconds(value, defaultSeconds) {
      const seconds = Number(value);
      if (Number.isFinite(seconds) && seconds > 0) {
        return seconds * 1000;
      }
      return defaultSeconds * 1000;
    }

    function updateStatus(state) {
      if (active) {
        const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
        setNodeStatus({
          fill: 'green',
          shape: 'dot',
          text: `ON ${remaining}s (${cycleCount})`,
        });
      } else {
        setNodeStatus({
          fill: state === 'warning' ? 'yellow' : 'grey',
          shape: state === 'warning' ? 'dot' : 'ring',
          text: state === 'warning' ? 'Pre-off' : 'Idle',
        });
      }
    }

    function clearTimers() {
      if (lightTimer) {
        timerBag.clearTimeout(lightTimer);
        lightTimer = null;
      }
      if (warningTimer) {
        timerBag.clearTimeout(warningTimer);
        warningTimer = null;
      }
      if (statusInterval) {
        timerBag.clearInterval(statusInterval);
        statusInterval = null;
      }
    }

    function buildOutputMessage(type, value, baseMsg) {
      const msg = baseMsg ? REDUtil.cloneMessage(baseMsg) : {};
      try {
        msg.payload = REDUtil.evaluateNodeProperty(value, type, node, baseMsg);
      } catch (err) {
        msg.payload = value;
      }
      return msg;
    }

    function sendMainOutput(on, baseMsg) {
      const type = on ? config.onPayloadType || 'bool' : config.offPayloadType || 'bool';
      const value = on ? config.onPayload : config.offPayload;
      const msg = buildOutputMessage(type, value, baseMsg);
      msg.event = on ? 'on' : 'off';
      node.send([msg, null]);
    }

    function sendWarningOutput(baseMsg, remainingSeconds) {
      const type = config.warningPayloadType || 'str';
      const value = config.warningPayload || 'warning';
      const msg = buildOutputMessage(type, value, baseMsg);
      msg.event = 'warning';
      msg.remaining = remainingSeconds;
      node.send([null, msg]);
      updateStatus('warning');
    }

    function scheduleStatusInterval() {
      if (!statusInterval) {
        statusInterval = timerBag.setInterval(() => {
          if (!active) {
            timerBag.clearInterval(statusInterval);
            statusInterval = null;
            return;
          }
          updateStatus();
        }, 1000);
      }
    }

    function forceOff() {
      if (!active) {
        updateStatus();
        return;
      }
      clearTimers();
      active = false;
      cycleCount += 1;
      sendMainOutput(false, lastTriggerMsg);
      updateStatus();
    }

    function scheduleWarning() {
      if (!warningEnabled) {
        return;
      }
      const remainingMs = expiresAt - Date.now();
      if (remainingMs <= warningOffsetMs) {
        // Not enough time for warning
        return;
      }
      warningTimer = timerBag.setTimeout(() => {
        const remainingSeconds = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
        sendWarningOutput(lastTriggerMsg, remainingSeconds);
      }, remainingMs - warningOffsetMs);
    }

    function scheduleOff() {
      clearTimers();
      const now = Date.now();
      expiresAt = now + durationMs;
      lightTimer = timerBag.setTimeout(() => {
        forceOff();
      }, durationMs);
      scheduleWarning();
      scheduleStatusInterval();
      updateStatus();
    }

    function activate(baseMsg) {
      lastTriggerMsg = baseMsg ? REDUtil.cloneMessage(baseMsg) : lastTriggerMsg;
      if (active) {
        if (restartOnTrigger) {
          scheduleOff();
        }
        return;
      }
      active = true;
      sendMainOutput(true, baseMsg);
      scheduleOff();
    }

    function handleControlMessage(msg) {
      let consumed = false;
      if (msg.command === 'start' || msg.command === 'on' || msg.start === true) {
        activate(msg);
        consumed = true;
      }
      if (msg.command === 'stop' || msg.command === 'off' || msg.stop === true) {
        forceOff();
        consumed = true;
      }
      if (msg.command === 'extend' || msg.extend === true) {
        if (active) {
          scheduleOff();
        }
        consumed = true;
      }
      if (msg.hasOwnProperty('duration')) {
        durationMs = toMilliseconds(msg.duration, durationMs / 1000);
        if (active) {
          scheduleOff();
        }
        consumed = true;
      }
      if (msg.hasOwnProperty('warningEnabled')) {
        warningEnabled = Boolean(msg.warningEnabled);
        consumed = true;
      }
      if (msg.hasOwnProperty('warningOffset')) {
        warningOffsetMs = toMilliseconds(msg.warningOffset, warningOffsetMs / 1000);
        if (active) {
          scheduleOff();
        }
        consumed = true;
      }
      return consumed;
    }

    node.on('input', (msg) => {
      if (msg.topic === controlTopic) {
        if (handleControlMessage(msg)) {
          return;
        }
      }

      const resolved = helpers.resolveInput(msg, payloadPropName, config.translatorConfig, RED);
      const value = resolved.boolean;
      if (value === true) {
        activate(msg);
      } else if (value === false && config.allowOffInput) {
        forceOff();
      }
    });

    node.on('close', () => {
      clearTimers();
    });

    updateStatus();
  }

  RED.nodes.registerType('StaircaseLightUltimate', StaircaseLightUltimate);
};
