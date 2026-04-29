'use strict';

module.exports = function (RED) {
  function DebouncerUltimate(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    const REDUtil = RED.util;
    const helpers = require('./lib/node-helpers.js');

    const setNodeStatus = helpers.createStatus(node);
    const timerBag = helpers.createTimerBag(node);

    const controlTopic = config.controlTopic || 'debouncer';

    let wait = Number(config.wait);
    if (!Number.isFinite(wait) || wait < 0) {
      wait = 500;
    }

    let emitOn = normalizeEmitOn(config.emitOn);
    let passedCount = 0;
    let droppedCount = 0;
    let currentState = 'idle';
    let debounceTimer = null;
    let leadingSent = false;
    let pendingMessage = null;

    function normalizeEmitOn(value) {
      const normalized = String(value || 'trailing').toLowerCase();
      return ['leading', 'trailing', 'both'].includes(normalized)
        ? normalized
        : 'trailing';
    }

    function clone(msg) {
      return REDUtil.cloneMessage ? REDUtil.cloneMessage(msg) : JSON.parse(JSON.stringify(msg));
    }

    function sendStatus() {
      const colour = currentState === 'idle' ? 'green' : 'yellow';
      const modeLabel = {
        leading: 'L',
        trailing: 'T',
        both: 'B',
      }[emitOn] || 'T';

      setNodeStatus({
        fill: colour,
        shape: 'dot',
        text: `DB|${modeLabel}|${currentState} pass:${passedCount} drop:${droppedCount}`,
      });
    }

    function emitForward(msg, nextState = 'idle') {
      passedCount += 1;
      currentState = nextState;
      node.send(msg);
      sendStatus();
    }

    function emitDrop() {
      droppedCount += 1;
      currentState = 'waiting';
      sendStatus();
    }

    function clearDebounce() {
      if (debounceTimer) {
        timerBag.clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      pendingMessage = null;
      leadingSent = false;
    }

    function resetDebounce() {
      clearDebounce();
      currentState = 'idle';
      sendStatus();
    }

    function flushPending() {
      if (!pendingMessage) {
        currentState = 'idle';
        sendStatus();
        return false;
      }

      const toSend = pendingMessage;
      if (debounceTimer) {
        timerBag.clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      pendingMessage = null;
      leadingSent = false;
      emitForward(toSend, 'idle');
      return true;
    }

    function handleControlMessage(msg) {
      let consumed = false;

      if (Object.prototype.hasOwnProperty.call(msg, 'wait')) {
        const nextWait = Number(msg.wait);
        if (Number.isFinite(nextWait) && nextWait >= 0) {
          wait = nextWait;
          consumed = true;
        }
      }

      if (typeof msg.emitOn === 'string') {
        emitOn = normalizeEmitOn(msg.emitOn);
        consumed = true;
      }

      if (msg.reset === true) {
        resetDebounce();
        consumed = true;
      }

      if (msg.flush === true) {
        flushPending();
        consumed = true;
      }

      if (msg.status === true) {
        consumed = true;
        sendStatus();
      }

      if (consumed) {
        sendStatus();
      }

      return consumed;
    }

    function handleDebounce(msg) {
      const cloned = clone(msg);

      if (debounceTimer) {
        timerBag.clearTimeout(debounceTimer);
        debounceTimer = null;
      }

      pendingMessage = cloned;
      currentState = 'waiting';

      const shouldEmitLeading =
        (emitOn === 'leading' || emitOn === 'both') && !leadingSent;

      if (shouldEmitLeading) {
        emitForward(cloned, 'waiting');
        leadingSent = true;
      }

      if (emitOn === 'leading' && !shouldEmitLeading) {
        emitDrop();
      }

      debounceTimer = timerBag.setTimeout(() => {
        debounceTimer = null;
        leadingSent = false;
        const shouldEmitTrailing = emitOn === 'trailing' || emitOn === 'both';

        if (shouldEmitTrailing && pendingMessage) {
          const toSend = pendingMessage;
          pendingMessage = null;
          emitForward(toSend, 'idle');
        } else {
          pendingMessage = null;
          currentState = 'idle';
          sendStatus();
        }
      }, wait);
    }

    node.on('input', function (msg) {
      if (msg.topic === controlTopic && handleControlMessage(msg)) {
        return;
      }

      handleDebounce(msg);
    });

    sendStatus();
  }

  RED.nodes.registerType('DebouncerUltimate', DebouncerUltimate);
};
