'use strict';

const { expect } = require('chai');
const { helper } = require('./helpers');

const hysteresisNode = require('../boolean-logic-ultimate/HysteresisUltimate.js');

function loadHysteresis(flow, credentials) {
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
  return helper.load(hysteresisNode, normalizedFlow, credentials || {});
}

describe('HysteresisUltimate node', function () {
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

  it('emits on state transitions only', function (done) {
    const flowId = 'hys1';
    const flow = [
      { id: flowId, type: 'tab', label: 'hys1' },
      {
        id: 'hys',
        type: 'HysteresisUltimate',
        z: flowId,
        mode: 'high',
        onThreshold: 70,
        offThreshold: 60,
        emitOnlyOnChange: true,
        onPayload: true,
        onPayloadType: 'bool',
        offPayload: false,
        offPayloadType: 'bool',
        wires: [['out'], ['diag']],
      },
      { id: 'in', type: 'helper', z: flowId, wires: [['hys']] },
      { id: 'out', type: 'helper', z: flowId },
      { id: 'diag', type: 'helper', z: flowId },
    ];

    loadHysteresis(flow).then(() => {
      const hys = helper.getNode('hys');
      const out = helper.getNode('out');
      const results = [];

      out.on('input', (msg) => {
        results.push(msg.payload);
        if (results.length === 2) {
          try {
            expect(results).to.deep.equal([true, false]);
            done();
          } catch (error) {
            done(error);
          }
        }
      });

      hys.receive({ topic: 'sensor', payload: 65 });
      hys.receive({ topic: 'sensor', payload: 72 });
      hys.receive({ topic: 'sensor', payload: 68 });
      hys.receive({ topic: 'sensor', payload: 58 });
    }).catch(done);
  });
});
