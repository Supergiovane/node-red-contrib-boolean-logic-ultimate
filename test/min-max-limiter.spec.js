'use strict';

const { expect } = require('chai');
const { helper } = require('./helpers');

const clampNode = require('../boolean-logic-ultimate/MinMaxLimiterUltimate.js');

function loadClamp(flow, credentials) {
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
  return helper.load(clampNode, normalizedFlow, credentials || {});
}

describe('MinMaxLimiterUltimate node', function () {
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

  function baseFlow(extra) {
    const flowId = 'clamp1';
    return [
      { id: flowId, type: 'tab', label: 'clamp1' },
      Object.assign(
        {
          id: 'clamp',
          type: 'MinMaxLimiterUltimate',
          z: flowId,
          min: 10,
          max: 90,
          payloadPropName: 'payload',
          wires: [['out']],
        },
        extra || {}
      ),
      { id: 'in', type: 'helper', z: flowId, wires: [['clamp']] },
      { id: 'out', type: 'helper', z: flowId },
    ];
  }

  it('clamps below min, above max and passes through in range', function (done) {
    loadClamp(baseFlow()).then(() => {
      const clamp = helper.getNode('clamp');
      const out = helper.getNode('out');
      const results = [];

      out.on('input', (msg) => {
        results.push(msg.payload);
        if (results.length === 3) {
          try {
            expect(results).to.deep.equal([10, 50, 90]);
            done();
          } catch (error) {
            done(error);
          }
        }
      });

      clamp.receive({ payload: 0 });
      clamp.receive({ payload: 50 });
      clamp.receive({ payload: 100 });
    }).catch(done);
  });

  it('exposes msg.clamp diagnostics', function (done) {
    loadClamp(baseFlow()).then(() => {
      const clamp = helper.getNode('clamp');
      const out = helper.getNode('out');

      out.on('input', (msg) => {
        try {
          expect(msg.clamp).to.deep.equal({
            clamped: true,
            input: 5,
            output: 10,
            min: 10,
            max: 90,
          });
          done();
        } catch (error) {
          done(error);
        }
      });

      clamp.receive({ payload: 5 });
    }).catch(done);
  });

  it('updates limits at runtime via control topic', function (done) {
    loadClamp(baseFlow({ controlTopic: 'clamp' })).then(() => {
      const clamp = helper.getNode('clamp');
      const out = helper.getNode('out');

      out.on('input', (msg) => {
        try {
          expect(msg.payload).to.equal(20);
          done();
        } catch (error) {
          done(error);
        }
      });

      clamp.receive({ topic: 'clamp', min: 20, max: 80 });
      clamp.receive({ payload: 5 });
    }).catch(done);
  });
});
