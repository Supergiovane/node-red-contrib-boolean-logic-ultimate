'use strict';

const { expect } = require('chai');
const { helper, loadRateLimiter } = require('./helpers');

describe('RateLimiterUltimate node', function () {
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

  it('debounce trailing emits after wait', function (done) {
    const flowId = 'flow1';
    const flow = [
      { id: flowId, type: 'tab', label: 'flow1' },
      {
        id: 'rate',
        type: 'RateLimiterUltimate',
        z: flowId,
        name: 'debounce-test',
        mode: 'debounce',
        wait: 40,
        emitOn: 'trailing',
        payloadPropName: 'payload',
        controlTopic: 'rate',
        statInterval: 0,
        wires: [['out'], ['diag']],
      },
      { id: 'in', type: 'helper', z: flowId, wires: [['rate']] },
      { id: 'out', type: 'helper', z: flowId },
      { id: 'diag', type: 'helper', z: flowId },
    ];

    loadRateLimiter(flow).then(() => {
      const input = helper.getNode('in');
      const out = helper.getNode('out');
      const diag = helper.getNode('diag');

      diag.on('input', () => done(new Error('Should not emit diagnostics for trailing debounce')));

      out.on('input', (msg) => {
        try {
          expect(msg.payload).to.equal('first');
          done();
        } catch (err) {
          done(err);
        }
      });

      input.receive({ topic: 'sensor', payload: 'first' });
    }).catch(done);
  });

  it('throttle drops rapid message when trailing disabled', function (done) {
    const flowId = 'flow2';
    const flow = [
      { id: flowId, type: 'tab', label: 'flow2' },
      {
        id: 'rate',
        type: 'RateLimiterUltimate',
        z: flowId,
        name: 'throttle-test',
        mode: 'throttle',
        interval: 120,
        trailing: false,
        payloadPropName: 'payload',
        controlTopic: 'rate',
        statInterval: 0,
        wires: [['out'], ['diag']],
      },
      { id: 'in', type: 'helper', z: flowId, wires: [['rate']] },
      { id: 'out', type: 'helper', z: flowId },
      { id: 'diag', type: 'helper', z: flowId },
    ];

    loadRateLimiter(flow).then(() => {
      const input = helper.getNode('in');
      const out = helper.getNode('out');
      const diag = helper.getNode('diag');
      let seenForward = 0;

      out.on('input', (msg) => {
        seenForward += 1;
        if (seenForward > 1) {
          done(new Error('Unexpected second forward message'));
        } else {
          expect(msg.payload).to.equal('first');
        }
      });

      diag.on('input', (msg) => {
        try {
          expect(msg.payload).to.have.property('reason', 'dropped-throttle');
          expect(msg.payload.msg.payload).to.equal('second');
          done();
        } catch (err) {
          done(err);
        }
      });

      input.receive({ topic: 'sensor', payload: 'first' });
      setTimeout(() => {
        input.receive({ topic: 'sensor', payload: 'second' });
      }, 20);
    }).catch(done);
  });

  it('window queue replays message after window expires', function (done) {
    const flowId = 'flow3';
    const flow = [
      { id: flowId, type: 'tab', label: 'flow3' },
      {
        id: 'rate',
        type: 'RateLimiterUltimate',
        z: flowId,
        name: 'window-test',
        mode: 'window',
        windowSize: 120,
        maxInWindow: 1,
        dropStrategy: 'queue',
        payloadPropName: 'payload',
        controlTopic: 'rate',
        statInterval: 0,
        wires: [['out'], ['diag']],
      },
      { id: 'in', type: 'helper', z: flowId, wires: [['rate']] },
      { id: 'out', type: 'helper', z: flowId },
      { id: 'diag', type: 'helper', z: flowId },
    ];

    loadRateLimiter(flow).then(() => {
      const input = helper.getNode('in');
      const out = helper.getNode('out');
      const diag = helper.getNode('diag');
      const start = Date.now();
      const outputs = [];

      diag.on('input', () => done(new Error('Queue strategy should not drop messages')));

      out.on('input', (msg) => {
        outputs.push({ msg, ts: Date.now() - start });
        if (outputs.length === 2) {
          try {
            expect(outputs[0].msg.payload).to.equal('one');
            expect(outputs[1].msg.payload).to.equal('two');
            expect(outputs[1].ts).to.be.at.least(100);
            done();
          } catch (err) {
            done(err);
          }
        }
      });

      input.receive({ topic: 'sensor', payload: 'one' });
      setTimeout(() => {
        input.receive({ topic: 'sensor', payload: 'two' });
      }, 20);
    }).catch(done);
  });
});
