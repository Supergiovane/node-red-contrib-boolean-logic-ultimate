'use strict';

const { expect } = require('chai');
const { helper, loadRailwaySwitch } = require('./helpers');

describe('RailwaySwitchUltimate node', function () {
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

  it('routes messages to the selected output pin', function (done) {
    const flowId = 'flow-rws-1';
    const flow = [
      { id: flowId, type: 'tab', label: 'flow-rws-1' },
      {
        id: 'rws',
        type: 'RailwaySwitchUltimate',
        z: flowId,
        name: 'rws',
        triggertopic: 'switcher',
        outputs: 5,
        initializewith: '0',
        payloadPropName: 'payload',
        translatorConfig: '',
        wires: [['out0'], ['out1'], ['out2'], ['out3'], ['out4']],
      },
      { id: 'in', type: 'helper', z: flowId, wires: [['rws']] },
      { id: 'out0', type: 'helper', z: flowId },
      { id: 'out1', type: 'helper', z: flowId },
      { id: 'out2', type: 'helper', z: flowId },
      { id: 'out3', type: 'helper', z: flowId },
      { id: 'out4', type: 'helper', z: flowId },
    ];

    loadRailwaySwitch(flow).then(() => {
      const rws = helper.getNode('rws');
      const out0 = helper.getNode('out0');
      const out1 = helper.getNode('out1');
      const out2 = helper.getNode('out2');
      const out3 = helper.getNode('out3');
      const out4 = helper.getNode('out4');

      const received = { out0: [], out1: [], out2: [], out3: [], out4: [] };
      out0.on('input', (msg) => received.out0.push(msg));
      out1.on('input', (msg) => received.out1.push(msg));
      out2.on('input', (msg) => received.out2.push(msg));
      out3.on('input', (msg) => received.out3.push(msg));
      out4.on('input', (msg) => received.out4.push(msg));

      rws.receive({ topic: 'switcher', payload: 2 });
      rws.receive({ topic: 'data', payload: 'train' });

      setTimeout(() => {
        try {
          expect(received.out0).to.have.length(0);
          expect(received.out1).to.have.length(0);
          expect(received.out3).to.have.length(0);
          expect(received.out4).to.have.length(0);
          expect(received.out2).to.have.length(1);
          expect(received.out2[0]).to.include({ topic: 'data', payload: 'train' });
          done();
        } catch (err) {
          done(err);
        }
      }, 50);
    }).catch(done);
  });

  it('ignores an out-of-range selector and keeps the current pin', function (done) {
    const flowId = 'flow-rws-2';
    const flow = [
      { id: flowId, type: 'tab', label: 'flow-rws-2' },
      {
        id: 'rws',
        type: 'RailwaySwitchUltimate',
        z: flowId,
        name: 'rws',
        triggertopic: 'switcher',
        outputs: 5,
        initializewith: '1',
        payloadPropName: 'payload',
        translatorConfig: '',
        wires: [['out0'], ['out1'], ['out2'], ['out3'], ['out4']],
      },
      { id: 'in', type: 'helper', z: flowId, wires: [['rws']] },
      { id: 'out0', type: 'helper', z: flowId },
      { id: 'out1', type: 'helper', z: flowId },
      { id: 'out2', type: 'helper', z: flowId },
      { id: 'out3', type: 'helper', z: flowId },
      { id: 'out4', type: 'helper', z: flowId },
    ];

    loadRailwaySwitch(flow).then(() => {
      const rws = helper.getNode('rws');
      const out0 = helper.getNode('out0');
      const out1 = helper.getNode('out1');
      const out2 = helper.getNode('out2');
      const out3 = helper.getNode('out3');
      const out4 = helper.getNode('out4');

      const received = { out0: [], out1: [], out2: [], out3: [], out4: [] };
      out0.on('input', (msg) => received.out0.push(msg));
      out1.on('input', (msg) => received.out1.push(msg));
      out2.on('input', (msg) => received.out2.push(msg));
      out3.on('input', (msg) => received.out3.push(msg));
      out4.on('input', (msg) => received.out4.push(msg));

      rws.receive({ topic: 'switcher', payload: 9 }); // out of range
      rws.receive({ topic: 'data', payload: 'train' });

      setTimeout(() => {
        try {
          expect(received.out0).to.have.length(0);
          expect(received.out2).to.have.length(0);
          expect(received.out3).to.have.length(0);
          expect(received.out4).to.have.length(0);
          expect(received.out1).to.have.length(1);
          expect(received.out1[0]).to.include({ topic: 'data', payload: 'train' });
          done();
        } catch (err) {
          done(err);
        }
      }, 50);
    }).catch(done);
  });

  it('is backward compatible when outputCount is missing (defaults to 5)', function (done) {
    const flowId = 'flow-rws-3';
    const flow = [
      { id: flowId, type: 'tab', label: 'flow-rws-3' },
      {
        id: 'rws',
        type: 'RailwaySwitchUltimate',
        z: flowId,
        name: 'rws',
        triggertopic: 'switcher',
        initializewith: '4',
        payloadPropName: 'payload',
        translatorConfig: '',
        wires: [['out0'], ['out1'], ['out2'], ['out3'], ['out4']],
      },
      { id: 'out0', type: 'helper', z: flowId },
      { id: 'out1', type: 'helper', z: flowId },
      { id: 'out2', type: 'helper', z: flowId },
      { id: 'out3', type: 'helper', z: flowId },
      { id: 'out4', type: 'helper', z: flowId },
    ];

    loadRailwaySwitch(flow).then(() => {
      const rws = helper.getNode('rws');
      const out4 = helper.getNode('out4');

      out4.on('input', (msg) => {
        try {
          expect(msg).to.include({ topic: 'data', payload: 'train' });
          done();
        } catch (err) {
          done(err);
        }
      });

      rws.receive({ topic: 'data', payload: 'train' });
    }).catch(done);
  });

  it('supports configuring outputs to 1', function (done) {
    const flowId = 'flow-rws-4';
    const flow = [
      { id: flowId, type: 'tab', label: 'flow-rws-4' },
      {
        id: 'rws',
        type: 'RailwaySwitchUltimate',
        z: flowId,
        name: 'rws',
        triggertopic: 'switcher',
        outputs: 1,
        initializewith: '0',
        payloadPropName: 'payload',
        translatorConfig: '',
        wires: [['out0']],
      },
      { id: 'out0', type: 'helper', z: flowId },
    ];

    loadRailwaySwitch(flow).then(() => {
      const rws = helper.getNode('rws');
      const out0 = helper.getNode('out0');

      out0.on('input', (msg) => {
        try {
          expect(msg).to.include({ topic: 'data', payload: 'train' });
          done();
        } catch (err) {
          done(err);
        }
      });

      rws.receive({ topic: 'switcher', payload: 1 }); // out of range for outputs=1
      rws.receive({ topic: 'data', payload: 'train' });
    }).catch(done);
  });

  it('is backward compatible with legacy outputCount when outputs is missing', function (done) {
    const flowId = 'flow-rws-5';
    const flow = [
      { id: flowId, type: 'tab', label: 'flow-rws-5' },
      {
        id: 'rws',
        type: 'RailwaySwitchUltimate',
        z: flowId,
        name: 'rws',
        triggertopic: 'switcher',
        outputCount: 3,
        initializewith: '0',
        payloadPropName: 'payload',
        translatorConfig: '',
        wires: [['out0'], ['out1'], ['out2']],
      },
      { id: 'out0', type: 'helper', z: flowId },
      { id: 'out1', type: 'helper', z: flowId },
      { id: 'out2', type: 'helper', z: flowId },
    ];

    loadRailwaySwitch(flow).then(() => {
      const rws = helper.getNode('rws');
      const out2 = helper.getNode('out2');

      out2.on('input', (msg) => {
        try {
          expect(msg).to.include({ topic: 'data', payload: 'train' });
          done();
        } catch (err) {
          done(err);
        }
      });

      rws.receive({ topic: 'switcher', payload: 2 });
      rws.receive({ topic: 'data', payload: 'train' });
    }).catch(done);
  });
});
