'use strict';

const { expect } = require('chai');
const { helper, loadSum } = require('./helpers');

function buildFlow(extra = {}) {
  const flowId = 'flow1';
  return [
    { id: flowId, type: 'tab', label: 'flow1' },
    {
      id: 'sum',
      type: 'SumUltimate',
      z: flowId,
      name: 'Total',
      property: 'payload',
      math: 'sum',
      subtractstartfrom: '',
      ...extra,
      wires: [['out']],
    },
    { id: 'out', type: 'helper', z: flowId },
  ];
}

describe('SumUltimate node', function () {
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

  it('emits a result for every message when no delay is set', function (done) {
    loadSum(buildFlow()).then(() => {
      const sum = helper.getNode('sum');
      const out = helper.getNode('out');
      const seen = [];

      out.on('input', (msg) => {
        seen.push(msg.payload);
      });

      sum.receive({ topic: 'a', payload: 1 });
      sum.receive({ topic: 'b', payload: 2 });
      sum.receive({ topic: 'c', payload: 3 });

      setTimeout(() => {
        try {
          expect(seen).to.deep.equal([1, 3, 6]);
          done();
        } catch (error) {
          done(error);
        }
      }, 50);
    }).catch(done);
  });

  it('emits a single result once the values settle when a delay is set', function (done) {
    loadSum(buildFlow({ delay: 40 })).then(() => {
      const sum = helper.getNode('sum');
      const out = helper.getNode('out');
      const seen = [];

      out.on('input', (msg) => {
        seen.push(msg);
      });

      sum.receive({ topic: 'a', payload: 1 });
      setTimeout(() => sum.receive({ topic: 'b', payload: 2 }), 10);
      setTimeout(() => sum.receive({ topic: 'c', payload: 3 }), 20);

      setTimeout(() => {
        try {
          expect(seen).to.have.length(1);
          expect(seen[0].payload).to.equal(6);
          expect(seen[0].measurements).to.equal(3);
          expect(seen[0].topic).to.equal('Total');
          done();
        } catch (error) {
          done(error);
        }
      }, 150);
    }).catch(done);
  });

  it('reset discards a pending delayed result', function (done) {
    loadSum(buildFlow({ delay: 40 })).then(() => {
      const sum = helper.getNode('sum');
      const out = helper.getNode('out');
      const seen = [];

      out.on('input', (msg) => {
        seen.push(msg.payload);
      });

      sum.receive({ topic: 'a', payload: 1 });
      setTimeout(() => sum.receive({ reset: true }), 10);

      setTimeout(() => {
        try {
          expect(seen).to.deep.equal([]);
          done();
        } catch (error) {
          done(error);
        }
      }, 120);
    }).catch(done);
  });

  it('does not emit when the value is not a number', function (done) {
    loadSum(buildFlow()).then(() => {
      const sum = helper.getNode('sum');
      const out = helper.getNode('out');
      const seen = [];

      out.on('input', (msg) => {
        seen.push(msg.payload);
      });

      sum.receive({ topic: 'a', payload: 'abc' });

      setTimeout(() => {
        try {
          expect(seen).to.deep.equal([]);
          done();
        } catch (error) {
          done(error);
        }
      }, 50);
    }).catch(done);
  });
});
