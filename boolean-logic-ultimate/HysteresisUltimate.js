'use strict';

module.exports = function (RED) {
  const helpers = require('./lib/node-helpers.js');

  function HysteresisUltimate(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    const REDUtil = RED.util;

    const setNodeStatus = helpers.createStatus(node);

    const controlTopic = config.controlTopic || 'hysteresis';
    const payloadPropName = config.payloadPropName || 'payload';
    const mode = (config.mode || 'high').toLowerCase(); // high | low
    const emitOnlyOnChange = config.emitOnlyOnChange !== false;

    let onThreshold = Number(config.onThreshold);
    let offThreshold = Number(config.offThreshold);
    let state = Boolean(config.initialState);

    if (!Number.isFinite(onThreshold)) onThreshold = 70;
    if (!Number.isFinite(offThreshold)) offThreshold = 65;

    function toNumber(value) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === 'boolean') {
        return value ? 1 : 0;
      }
      if (typeof value === 'string') {
        const v = Number(value.trim());
        return Number.isFinite(v) ? v : undefined;
      }
      return undefined;
    }

    function evaluateTyped(typedValue, typedType, baseMsg, fallback) {
      try {
        return REDUtil.evaluateNodeProperty(typedValue, typedType || 'bool', node, baseMsg);
      } catch (error) {
        return fallback;
      }
    }

    function updateStatus(lastValue) {
      const direction = mode === 'low' ? 'LOW' : 'HIGH';
      const valueText = lastValue === undefined ? '-' : Number(lastValue).toFixed(2);
      setNodeStatus({
        fill: state ? 'green' : 'grey',
        shape: state ? 'dot' : 'ring',
        text: `${direction} ${valueText} on:${onThreshold} off:${offThreshold}`,
      });
    }

    function evaluateState(value) {
      let nextState = state;
      if (mode === 'low') {
        if (value <= onThreshold) {
          nextState = true;
        } else if (value >= offThreshold) {
          nextState = false;
        }
      } else {
        if (value >= onThreshold) {
          nextState = true;
        } else if (value <= offThreshold) {
          nextState = false;
        }
      }
      return nextState;
    }

    function emitDiagnostics(baseMsg, payload) {
      const msg = baseMsg ? REDUtil.cloneMessage(baseMsg) : {};
      msg.topic = `${controlTopic}/event`;
      msg.payload = payload;
      node.send([null, msg]);
    }

    function emitState(baseMsg, changed, inputValue) {
      if (!changed && emitOnlyOnChange) {
        updateStatus(inputValue);
        return;
      }
      const msg = baseMsg ? REDUtil.cloneMessage(baseMsg) : {};
      msg.payload = state
        ? evaluateTyped(config.onPayload, config.onPayloadType, baseMsg, true)
        : evaluateTyped(config.offPayload, config.offPayloadType, baseMsg, false);
      msg.hysteresis = {
        state,
        changed,
        mode,
        value: inputValue,
        onThreshold,
        offThreshold,
      };
      msg.event = changed ? 'state_changed' : 'state_confirmed';
      node.send([msg, null]);
      updateStatus(inputValue);
    }

    function handleControl(msg) {
      let consumed = false;

      if (msg.reset === true) {
        state = Boolean(config.initialState);
        emitDiagnostics(msg, {
          event: 'reset',
          state,
          onThreshold,
          offThreshold,
          mode,
        });
        consumed = true;
      }

      if (Object.prototype.hasOwnProperty.call(msg, 'onThreshold')) {
        const next = Number(msg.onThreshold);
        if (Number.isFinite(next)) {
          onThreshold = next;
          consumed = true;
        }
      }

      if (Object.prototype.hasOwnProperty.call(msg, 'offThreshold')) {
        const next = Number(msg.offThreshold);
        if (Number.isFinite(next)) {
          offThreshold = next;
          consumed = true;
        }
      }

      if (Object.prototype.hasOwnProperty.call(msg, 'state')) {
        state = Boolean(msg.state);
        emitState(msg, true, undefined);
        consumed = true;
      }

      if (msg.status === true) {
        emitDiagnostics(msg, {
          event: 'status',
          state,
          mode,
          onThreshold,
          offThreshold,
        });
        consumed = true;
      }

      if (consumed) {
        updateStatus();
      }

      return consumed;
    }

    node.on('input', (msg) => {
      if (msg.topic === controlTopic && handleControl(msg)) {
        return;
      }

      const resolved = helpers.resolveInput(msg, payloadPropName, config.translatorConfig, RED);
      const inputValue = toNumber(resolved.value);

      if (inputValue === undefined) {
        emitDiagnostics(msg, {
          event: 'invalid_input',
          value: resolved.value,
          property: payloadPropName,
        });
        return;
      }

      const nextState = evaluateState(inputValue);
      const changed = nextState !== state;
      state = nextState;
      emitState(msg, changed, inputValue);

      if (changed) {
        emitDiagnostics(msg, {
          event: 'state_changed',
          state,
          value: inputValue,
          mode,
          onThreshold,
          offThreshold,
        });
      }
    });

    updateStatus();
  }

  RED.nodes.registerType('HysteresisUltimate', HysteresisUltimate);
};
