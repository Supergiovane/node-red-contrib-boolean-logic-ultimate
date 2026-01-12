'use strict';

const path = require('path');
const helper = require('node-red-node-test-helper');

helper.init(require.resolve('node-red')); // initialise with Node-RED runtime

const nodes = {
  RateLimiterUltimate: require(path.join('..', 'boolean-logic-ultimate', 'RateLimiterUltimate.js')),
  PresenceSimulatorUltimate: require(path.join('..', 'boolean-logic-ultimate', 'PresenceSimulatorUltimate.js')),
  RailwaySwitchUltimate: require(path.join('..', 'boolean-logic-ultimate', 'RailwaySwitchUltimate.js')),
};

function loadNode(nodeDef, flow, credentials = {}) {
  const normalizedFlow = flow.map((node, index) => {
    if (
      node &&
      node.type &&
      node.type !== 'tab' &&
      node.type !== 'subflow' &&
      node.type !== 'group' &&
      node.z &&
      !(Object.prototype.hasOwnProperty.call(node, 'x') && Object.prototype.hasOwnProperty.call(node, 'y'))
    ) {
      return { ...node, x: 100 + index * 10, y: 100 + index * 10 };
    }
    return node;
  });
  return helper.load(nodeDef, normalizedFlow, credentials);
}

function loadRateLimiter(flow, credentials = {}) {
  return loadNode(nodes.RateLimiterUltimate, flow, credentials);
}

function loadPresence(flow, credentials = {}) {
  return loadNode(nodes.PresenceSimulatorUltimate, flow, credentials);
}

function loadRailwaySwitch(flow, credentials = {}) {
  return loadNode(nodes.RailwaySwitchUltimate, flow, credentials);
}

module.exports = {
  helper,
  loadRateLimiter,
  loadPresence,
  loadRailwaySwitch,
};
