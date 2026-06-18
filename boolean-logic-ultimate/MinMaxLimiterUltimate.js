'use strict';

module.exports = function (RED) {
  const helpers = require('./lib/node-helpers.js');

  function MinMaxLimiterUltimate(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    const REDUtil = RED.util;

    const setNodeStatus = helpers.createStatus(node);

    const controlTopic = config.controlTopic || 'clamp';
    const payloadPropName = config.payloadPropName || 'payload';
    const passInvalid = config.passInvalid === true;

    let min = Number(config.min);
    let max = Number(config.max);

    if (!Number.isFinite(min)) min = 10;
    if (!Number.isFinite(max)) max = 90;

    function normalizeLimits() {
      // Keep min <= max even if the user (or a control message) swaps them.
      if (Number.isFinite(min) && Number.isFinite(max) && min > max) {
        const tmp = min;
        min = max;
        max = tmp;
      }
    }

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

    function updateStatus(lastValue, clamped) {
      let text;
      if (lastValue === undefined) {
        text = `min:${min} max:${max}`;
      } else {
        const valueText = Number(lastValue).toFixed(2).replace(/\.00$/, '');
        text = `${valueText} [${min}..${max}]`;
      }
      setNodeStatus({
        fill: clamped ? 'yellow' : 'green',
        shape: clamped ? 'ring' : 'dot',
        text,
      });
    }

    function handleControl(msg) {
      let consumed = false;

      if (Object.prototype.hasOwnProperty.call(msg, 'min')) {
        const next = Number(msg.min);
        if (Number.isFinite(next)) {
          min = next;
          consumed = true;
        }
      }

      if (Object.prototype.hasOwnProperty.call(msg, 'max')) {
        const next = Number(msg.max);
        if (Number.isFinite(next)) {
          max = next;
          consumed = true;
        }
      }

      if (consumed) {
        normalizeLimits();
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
        node.warn(`MinMaxLimiterUltimate: '${payloadPropName}' is not a number (${resolved.value})`);
        updateStatus();
        if (passInvalid) {
          node.send(msg);
        }
        return;
      }

      let outputValue = inputValue;
      if (outputValue < min) outputValue = min;
      if (outputValue > max) outputValue = max;
      const clamped = outputValue !== inputValue;

      REDUtil.setMessageProperty(msg, payloadPropName, outputValue, true);
      msg.clamp = {
        clamped,
        input: inputValue,
        output: outputValue,
        min,
        max,
      };

      node.send(msg);
      updateStatus(inputValue, clamped);
    });

    normalizeLimits();
    updateStatus();
  }

  RED.nodes.registerType('MinMaxLimiterUltimate', MinMaxLimiterUltimate);
};
