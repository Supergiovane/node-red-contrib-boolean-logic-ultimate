'use strict';

module.exports = function (RED) {
  const helpers = require('./lib/node-helpers.js');

  function PresenceSimulatorUltimate(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.config = config;

    const {
      controlTopic = 'presence',
      autoStart = false,
      autoLoop = true,
      randomize = false,
      jitter = 0,
      payloadPropName = 'payload',
      translatorConfig,
      patterns = '',
    } = config;

    const setNodeStatus = helpers.createStatus(node);
    const timerBag = helpers.createTimerBag(node);

    let eventSequence = parsePatterns(patterns || '');
    let currentIndex = 0;
    let running = false;
    let scheduledTimer = null;
    let emittedCount = 0;

    function parsePatterns(text) {
      const events = [];
      if (!text) {
        return events;
      }
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          if (typeof entry.delay !== 'number' || entry.delay < 0) {
            continue;
          }
          events.push(entry);
        } catch (err) {
          // Ignore malformed lines
          node.log(`PresenceSimulatorUltimate: unable to parse pattern line: ${line}`);
        }
      }
      return events;
    }

    function resetState() {
      stopPlayback();
      currentIndex = 0;
      emittedCount = 0;
    }

    function updateStatus(state) {
      const label = state || (running ? 'running' : 'idle');
      const colour = running ? 'green' : 'grey';
      setNodeStatus({
        fill: colour,
        shape: running ? 'dot' : 'ring',
        text: `Presence ${label} sent:${emittedCount}`,
      });
    }

    function scheduleNext(delay, handler) {
      if (scheduledTimer) {
        timerBag.clearTimeout(scheduledTimer);
        scheduledTimer = null;
      }
      scheduledTimer = timerBag.setTimeout(handler, delay);
    }

    function computeDelay(baseDelay) {
      if (!randomize) {
        return baseDelay;
      }
      const jitterValue = Number(config.jitter ?? jitter) || 0;
      if (jitterValue <= 0) {
        return baseDelay;
      }
      const perc = Math.min(Math.max(jitterValue, 0), 100);
      const delta = baseDelay * (perc / 100);
      const min = Math.max(0, baseDelay - delta);
      const max = baseDelay + delta;
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function emitEvent(event) {
      if (!event) {
        return;
      }
      const msg = {
        topic: event.topic || config.outputTopic || node.topic || 'presence',
      };
      if (event.hasOwnProperty('payload')) {
        msg.payload = event.payload;
      }
      if (event.hasOwnProperty('properties') && typeof event.properties === 'object') {
        Object.assign(msg, event.properties);
      }
      if (event.clone && typeof event.clone === 'object') {
        Object.assign(msg, event.clone);
      }
      emittedCount += 1;
      node.send(msg);
      updateStatus('playing');
    }

    function nextEventIndex() {
      if (eventSequence.length === 0) {
        return -1;
      }
      if (config.autoLoop ?? autoLoop) {
        currentIndex = (currentIndex + 1) % eventSequence.length;
        return currentIndex;
      }
      currentIndex += 1;
      if (currentIndex >= eventSequence.length) {
        return -1;
      }
      return currentIndex;
    }

    function playFrom(index) {
      if (!running || eventSequence.length === 0) {
        stopPlayback();
        return;
      }
      const event = eventSequence[index];
      if (!event) {
        stopPlayback();
        return;
      }
      const delay = computeDelay(event.delay);
      scheduleNext(delay, () => {
        emitEvent(event);
        const nextIndex = nextEventIndex();
        if (nextIndex === -1) {
          stopPlayback();
        } else {
          playFrom(nextIndex);
        }
      });
    }

    function startPlayback() {
      if (running) {
        return;
      }
      if (!eventSequence.length) {
        updateStatus('no events');
        return;
      }
      running = true;
      updateStatus('starting');
      currentIndex = currentIndex % eventSequence.length;
      playFrom(currentIndex);
    }

    function stopPlayback() {
      running = false;
      if (scheduledTimer) {
        timerBag.clearTimeout(scheduledTimer);
        scheduledTimer = null;
      }
      updateStatus('stopped');
    }

    function setSequence(newSequence) {
      if (Array.isArray(newSequence)) {
        eventSequence = newSequence
          .filter((entry) => entry && typeof entry.delay === 'number' && entry.delay >= 0)
          .map((entry) => ({ ...entry }));
        currentIndex = 0;
        emittedCount = 0;
        updateStatus('sequence loaded');
      }
    }

    function handleControlMessage(msg) {
      let consumed = false;
      if (msg.reset === true) {
        resetState();
        consumed = true;
      }
      if (msg.start === true || msg.command === 'start') {
        startPlayback();
        consumed = true;
      }
      if (msg.stop === true || msg.command === 'stop') {
        stopPlayback();
        consumed = true;
      }
      if (msg.hasOwnProperty('sequence') && Array.isArray(msg.sequence)) {
        setSequence(msg.sequence);
        consumed = true;
      }
      if (msg.hasOwnProperty('loop')) {
        config.autoLoop = Boolean(msg.loop);
        consumed = true;
      }
      if (msg.hasOwnProperty('randomize')) {
        config.randomize = Boolean(msg.randomize);
        consumed = true;
      }
      if (msg.hasOwnProperty('jitter')) {
        config.jitter = Number(msg.jitter);
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

      // Optional runtime addition: if message contains inline event, enqueue it
      if (msg.hasOwnProperty('delay') && typeof msg.delay === 'number') {
        eventSequence.push({
          delay: msg.delay,
          payload: msg[payloadPropName],
          topic: msg.topic,
          properties: msg.properties,
        });
        updateStatus('event added');
      }
    });

    node.on('close', () => {
      stopPlayback();
    });

    updateStatus();
    if (autoStart) {
      startPlayback();
    }
  }

  RED.nodes.registerType('PresenceSimulatorUltimate', PresenceSimulatorUltimate);
};
