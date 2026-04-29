'use strict';

const { expect } = require('chai');
const { helper, loadDebouncer } = require('./helpers');

describe('DebouncerUltimate node', function () {
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

  it('trailing debounce emits only the last message after quiet time', function (done) {
    const flowId = 'flow1';
    const flow = [
      { id: flowId, type: 'tab', label: 'flow1' },
      {
        id: 'debouncer',
        type: 'DebouncerUltimate',
        z: flowId,
        wait: 40,
        emitOn: 'trailing',
        controlTopic: 'debouncer',
        wires: [['out']],
      },
      { id: 'in', type: 'helper', z: flowId, wires: [['debouncer']] },
      { id: 'out', type: 'helper', z: flowId },
    ];

    loadDebouncer(flow).then(() => {
      const debouncer = helper.getNode('debouncer');
      const out = helper.getNode('out');
      const seen = [];

      out.on('input', (msg) => {
        seen.push(msg.payload);
      });

      debouncer.receive({ topic: 'sensor', payload: 'first' });
      setTimeout(() => {
        debouncer.receive({ topic: 'sensor', payload: 'second' });
      }, 15);

      setTimeout(() => {
        try {
          expect(seen).to.deep.equal(['second']);
          done();
        } catch (error) {
          done(error);
        }
      }, 120);
    }).catch(done);
  });

  it('both mode emits first immediately and last after quiet time', function (done) {
    const flowId = 'flow2';
    const flow = [
      { id: flowId, type: 'tab', label: 'flow2' },
      {
        id: 'debouncer',
        type: 'DebouncerUltimate',
        z: flowId,
        wait: 50,
        emitOn: 'both',
        controlTopic: 'debouncer',
        wires: [['out']],
      },
      { id: 'in', type: 'helper', z: flowId, wires: [['debouncer']] },
      { id: 'out', type: 'helper', z: flowId },
    ];

    loadDebouncer(flow).then(() => {
      const debouncer = helper.getNode('debouncer');
      const out = helper.getNode('out');
      const seen = [];

      out.on('input', (msg) => {
        seen.push(msg.payload);
      });

      debouncer.receive({ topic: 'sensor', payload: 'first' });
      setTimeout(() => {
        debouncer.receive({ topic: 'sensor', payload: 'second' });
      }, 15);

      setTimeout(() => {
        try {
          expect(seen).to.deep.equal(['first', 'second']);
          done();
        } catch (error) {
          done(error);
        }
      }, 140);
    }).catch(done);
  });

  it('leading mode emits only the first message during the debounce window', function (done) {
    const flowId = 'flow3';
    const flow = [
      { id: flowId, type: 'tab', label: 'flow3' },
      {
        id: 'debouncer',
        type: 'DebouncerUltimate',
        z: flowId,
        wait: 60,
        emitOn: 'leading',
        controlTopic: 'debouncer',
        wires: [['out']],
      },
      { id: 'in', type: 'helper', z: flowId, wires: [['debouncer']] },
      { id: 'out', type: 'helper', z: flowId },
    ];

    loadDebouncer(flow).then(() => {
      const debouncer = helper.getNode('debouncer');
      const out = helper.getNode('out');
      const seen = [];

      out.on('input', (msg) => {
        seen.push(msg.payload);
      });

      debouncer.receive({ topic: 'sensor', payload: 'first' });
      setTimeout(() => {
        debouncer.receive({ topic: 'sensor', payload: 'second' });
      }, 15);

      setTimeout(() => {
        try {
          expect(seen).to.deep.equal(['first']);
          done();
        } catch (error) {
          done(error);
        }
      }, 140);
    }).catch(done);
  });
});
