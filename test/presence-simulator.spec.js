'use strict';

const { expect } = require('chai');
const { helper, loadPresence } = require('./helpers');

describe('PresenceSimulatorUltimate node', function () {
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

  it('plays sequence after start command', function (done) {
    const flowId = 'flowPresence1';
    const flow = [
      { id: flowId, type: 'tab', label: 'presence1' },
      {
        id: 'presence',
        type: 'PresenceSimulatorUltimate',
        z: flowId,
        name: '',
        controlTopic: 'presence',
        autoStart: false,
        autoLoop: false,
        randomize: false,
        patterns: '{"delay":20,"payload":true,"topic":"light"}',
        wires: [['out']],
      },
      { id: 'in', type: 'helper', z: flowId, wires: [['presence']] },
      { id: 'out', type: 'helper', z: flowId },
    ];

    loadPresence(flow).then(() => {
      const presence = helper.getNode('presence');
      const out = helper.getNode('out');

      out.on('input', (msg) => {
        try {
          expect(msg).to.have.property('payload', true);
          expect(msg).to.have.property('topic', 'light');
          done();
        } catch (err) {
          done(err);
        }
      });

      presence.receive({ topic: 'presence', command: 'start' });
    }).catch(done);
  });

  it('stops sequence on stop command', function (done) {
    const flowId = 'flowPresence2';
    const flow = [
      { id: flowId, type: 'tab', label: 'presence2' },
      {
        id: 'presence',
        type: 'PresenceSimulatorUltimate',
        z: flowId,
        controlTopic: 'presence',
        autoStart: false,
        autoLoop: true,
        randomize: false,
        patterns: '{"delay":20,"payload":"on","topic":"light"}',
        wires: [['out']],
      },
      { id: 'in', type: 'helper', z: flowId, wires: [['presence']] },
      { id: 'out', type: 'helper', z: flowId },
    ];

    loadPresence(flow).then(() => {
      const presence = helper.getNode('presence');
      const out = helper.getNode('out');
      let received = 0;

      out.on('input', () => {
        received += 1;
        if (received === 1) {
          presence.receive({ topic: 'presence', command: 'stop' });
          setTimeout(() => {
            try {
              expect(received).to.equal(1);
              done();
            } catch (err) {
              done(err);
            }
          }, 100);
        }
      });

      presence.receive({ topic: 'presence', command: 'start' });
    }).catch(done);
  });
});
