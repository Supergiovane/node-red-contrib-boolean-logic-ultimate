'use strict';

const path = require('path');
const helper = require('node-red-node-test-helper');

helper.init(require.resolve('node-red')); // initialise with Node-RED runtime

const nodes = {
  RateLimiterUltimate: require(path.join('..', 'boolean-logic-ultimate', 'RateLimiterUltimate.js')),
  PresenceSimulatorUltimate: require(path.join('..', 'boolean-logic-ultimate', 'PresenceSimulatorUltimate.js')),
};

function loadNode(nodeDef, flow, credentials = {}) {
  return helper.load(nodeDef, flow, credentials);
}

function loadRateLimiter(flow, credentials = {}) {
  return loadNode(nodes.RateLimiterUltimate, flow, credentials);
}

function loadPresence(flow, credentials = {}) {
  return loadNode(nodes.PresenceSimulatorUltimate, flow, credentials);
}

module.exports = {
  helper,
  loadRateLimiter,
  loadPresence,
};
