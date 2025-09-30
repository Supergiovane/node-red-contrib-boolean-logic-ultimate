'use strict';

const { expect } = require('chai');
const { helper } = require('./helpers');

const staircaseNode = require('../boolean-logic-ultimate/StaircaseLightUltimate.js');

function loadStaircase(flow, credentials) {
  return helper.load(staircaseNode, flow, credentials || {});
}

describe('StaircaseLightUltimate node', function () {
  this.timeout(5000);

  before(function (done) {
    helper.startServer(done);
  });

  after(function (done) {
    helper.stopServer(done);
  });

  afterEach(function () {
    return helper.unload();
  });

  it('emits warning before turning off', function (done) {
    const flowId = 'stair1';
    const flow = [
      { id: flowId, type: 'tab', label: 'stair1' },
      {
        id: 'stair',
        type: 'StaircaseLightUltimate',
        z: flowId,
        controlTopic: 'stairs',
        durationSeconds: 0.2,
        warningEnabled: true,
        warningOffsetSeconds: 0.1,
        restartOnTrigger: true,
        allowOffInput: false,
        onPayload: true,
        onPayloadType: 'bool',
        offPayload: false,
        offPayloadType: 'bool',
        warningPayload: 'warning',
        warningPayloadType: 'str',
        wires: [['outOn'], ['outWarn']],
      },
      { id: 'in', type: 'helper', z: flowId, wires: [['stair']] },
      { id: 'outOn', type: 'helper', z: flowId },
      { id: 'outWarn', type: 'helper', z: flowId },
    ];

    loadStaircase(flow).then(() => {
      const input = helper.getNode('in');
      const outOn = helper.getNode('outOn');
      const outWarn = helper.getNode('outWarn');
      const events = [];

      outOn.on('input', (msg) => {
        events.push({ type: msg.event, payload: msg.payload });
      });
      outWarn.on('input', (msg) => {
        events.push({ type: msg.event, payload: msg.payload });
      });

      setTimeout(() => {
        try {
          const types = events.map((e) => e.type);
          expect(types).to.include('on');
          expect(types).to.include('warning');
          expect(types).to.include('off');
          done();
        } catch (err) {
          done(err);
        }
      }, 400);

      input.receive({ payload: true });
    }).catch(done);
  });

  it('extends timer on control extend command', function (done) {
    const flowId = 'stair2';
    const flow = [
      { id: flowId, type: 'tab', label: 'stair2' },
      {
        id: 'stair',
        type: 'StaircaseLightUltimate',
        z: flowId,
        controlTopic: 'stairs',
        durationSeconds: 0.15,
        warningEnabled: false,
        restartOnTrigger: true,
        onPayload: true,
        onPayloadType: 'bool',
        offPayload: false,
        offPayloadType: 'bool',
        wires: [['out'], ['warn']],
      },
      { id: 'in', type: 'helper', z: flowId, wires: [['stair']] },
      { id: 'control', type: 'helper', z: flowId, wires: [['stair']] },
      { id: 'out', type: 'helper', z: flowId },
      { id: 'warn', type: 'helper', z: flowId },
    ];

    loadStaircase(flow).then(() => {
      const input = helper.getNode('in');
      const control = helper.getNode('control');
      const out = helper.getNode('out');
      const events = [];

      out.on('input', (msg) => {
        events.push({ type: msg.event, at: Date.now() });
      });

      input.receive({ payload: true });

      setTimeout(() => {
        control.receive({ topic: 'stairs', command: 'extend' });
      }, 80);

      setTimeout(() => {
        try {
          const offEvents = events.filter((e) => e.type === 'off');
          expect(offEvents.length).to.equal(1);
          done();
        } catch (err) {
          done(err);
        }
      }, 400);
    }).catch(done);
  });
});
