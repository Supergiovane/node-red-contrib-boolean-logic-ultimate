'use strict';

const utils = require('../utils.js');

function createStatus(node) {
  return function setNodeStatus({ fill, shape, text }) {
    const dDate = new Date();
    node.status({
      fill,
      shape,
      text: `${text} (${dDate.getDate()}, ${dDate.toLocaleTimeString()})`,
    });
  };
}

function resolveInput(msg, propertyPath, translatorConfigId, RED) {
  const propName = propertyPath || 'payload';
  let value;
  try {
    value = utils.fetchFromObject(msg, propName);
  } catch (error) {
    return { value: undefined, boolean: undefined };
  }
  if (value === undefined) {
    return { value: undefined, boolean: undefined };
  }

  const translatorConfig = translatorConfigId
    ? RED.nodes.getNode(translatorConfigId)
    : null;

  return {
    value,
    boolean: utils.ToBoolean(value, translatorConfig),
  };
}

function createTimerBag(node) {
  const timers = new Set();
  const intervals = new Set();

  function trackTimeout(handle) {
    timers.add(handle);
    return handle;
  }

  function trackInterval(handle) {
    intervals.add(handle);
    return handle;
  }

  function clearAll() {
    for (const handle of timers) {
      clearTimeout(handle);
    }
    timers.clear();
    for (const handle of intervals) {
      clearInterval(handle);
    }
    intervals.clear();
  }

  node.on('close', (_removed, done) => {
    clearAll();
    done();
  });

  return {
    setTimeout(fn, timeout) {
      const handle = setTimeout(() => {
        timers.delete(handle);
        fn();
      }, timeout);
      return trackTimeout(handle);
    },
    setInterval(fn, interval) {
      const handle = setInterval(fn, interval);
      return trackInterval(handle);
    },
    clearTimeout(handle) {
      clearTimeout(handle);
      timers.delete(handle);
    },
    clearInterval(handle) {
      clearInterval(handle);
      intervals.delete(handle);
    },
    clearAll,
  };
}

module.exports = {
  createStatus,
  resolveInput,
  createTimerBag,
};
