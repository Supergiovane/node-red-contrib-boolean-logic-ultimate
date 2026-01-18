'use strict';

const { expect } = require('chai');
const { helper } = require('./helpers');

const alarmNode = require('../boolean-logic-ultimate/AlarmSystemUltimate.js');

function loadAlarm(flow, credentials) {
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
  return helper.load(alarmNode, normalizedFlow, credentials || {});
}

describe('AlarmSystemUltimate node', function () {
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

  it('triggers alarm after entry delay', function (done) {
    const flowId = 'alarm1';
    const flow = [
      { id: flowId, type: 'tab', label: 'alarm1' },
      {
        id: 'alarm',
        type: 'AlarmSystemUltimate',
        z: flowId,
        controlTopic: 'alarm',
        exitDelaySeconds: 0.05,
        entryDelaySeconds: 0.05,
        sirenDurationSeconds: 0.05,
        sirenLatchUntilDisarm: false,
        requireCodeForDisarm: false,
        blockArmOnViolations: true,
        zones: '{"id":"front","name":"Front","topic":"sensor/frontdoor","type":"perimeter","entry":true,"modes":["away","home","night"]}',
        wires: [['events'], ['siren']],
      },
      { id: 'events', type: 'helper', z: flowId },
      { id: 'siren', type: 'helper', z: flowId },
    ];

    loadAlarm(flow).then(() => {
      const alarm = helper.getNode('alarm');
      const events = helper.getNode('events');
      const siren = helper.getNode('siren');

      const received = { entry: false, alarm: false, sirenOn: false };

      function maybeDone() {
        if (received.entry && received.alarm && received.sirenOn) {
          done();
        }
      }

      events.on('input', (msg) => {
        try {
          if (msg.event === 'entry_delay') {
            received.entry = true;
          }
          if (msg.event === 'alarm') {
            received.alarm = true;
          }
          maybeDone();
        } catch (err) {
          done(err);
        }
      });

      siren.on('input', (msg) => {
        try {
          if (msg.event === 'siren_on') {
            received.sirenOn = true;
          }
          maybeDone();
        } catch (err) {
          done(err);
        }
      });

      alarm.receive({ topic: 'alarm', command: 'arm_away' });
      setTimeout(() => {
        alarm.receive({ topic: 'sensor/frontdoor', payload: 'open' });
      }, 80);
    }).catch(done);
  });

  it('disarms during entry delay and prevents alarm', function (done) {
    const flowId = 'alarm2';
    const flow = [
      { id: flowId, type: 'tab', label: 'alarm2' },
      {
        id: 'alarm',
        type: 'AlarmSystemUltimate',
        z: flowId,
        controlTopic: 'alarm',
        exitDelaySeconds: 0.05,
        entryDelaySeconds: 0.1,
        sirenDurationSeconds: 0.2,
        requireCodeForDisarm: false,
        zones: '{"id":"front","topic":"sensor/frontdoor","type":"perimeter","entry":true,"modes":["away"]}',
        wires: [['events'], ['siren']],
      },
      { id: 'events', type: 'helper', z: flowId },
      { id: 'siren', type: 'helper', z: flowId },
    ];

    loadAlarm(flow).then(() => {
      const alarm = helper.getNode('alarm');
      const events = helper.getNode('events');
      const siren = helper.getNode('siren');

      const seenEvents = [];
      const sirenOn = [];

      events.on('input', (msg) => {
        seenEvents.push(msg.event);
        if (msg.event === 'entry_delay') {
          setTimeout(() => {
            alarm.receive({ topic: 'alarm', command: 'disarm' });
          }, 20);
        }
      });

      siren.on('input', (msg) => {
        if (msg.event === 'siren_on') {
          sirenOn.push(msg);
        }
      });

      alarm.receive({ topic: 'alarm', command: 'arm_away' });
      setTimeout(() => {
        alarm.receive({ topic: 'sensor/frontdoor', payload: 'open' });
      }, 80);

      setTimeout(() => {
        try {
          expect(seenEvents).to.include('entry_delay');
          expect(seenEvents).to.include('disarmed');
          expect(seenEvents).to.not.include('alarm');
          expect(sirenOn.length).to.equal(0);
          done();
        } catch (err) {
          done(err);
        }
      }, 300);
    }).catch(done);
  });

  it('bypasses a zone and ignores its trigger', function (done) {
    const flowId = 'alarm3';
    const flow = [
      { id: flowId, type: 'tab', label: 'alarm3' },
      {
        id: 'alarm',
        type: 'AlarmSystemUltimate',
        z: flowId,
        controlTopic: 'alarm',
        exitDelaySeconds: 0.05,
        entryDelaySeconds: 0.05,
        sirenDurationSeconds: 0.2,
        requireCodeForDisarm: false,
        zones: '{"id":"front","topic":"sensor/frontdoor","type":"perimeter","entry":false,"modes":["away"],"bypassable":true}',
        wires: [['events'], ['siren']],
      },
      { id: 'events', type: 'helper', z: flowId },
      { id: 'siren', type: 'helper', z: flowId },
    ];

    loadAlarm(flow).then(() => {
      const alarm = helper.getNode('alarm');
      const events = helper.getNode('events');
      const siren = helper.getNode('siren');

      const seenEvents = [];
      let sirenOn = false;

      events.on('input', (msg) => {
        seenEvents.push(msg.event);
      });

      siren.on('input', (msg) => {
        if (msg.event === 'siren_on') {
          sirenOn = true;
        }
      });

      alarm.receive({ topic: 'alarm', command: 'bypass', zone: 'front' });
      alarm.receive({ topic: 'alarm', command: 'arm_away' });
      setTimeout(() => {
        alarm.receive({ topic: 'sensor/frontdoor', payload: 'open' });
      }, 80);

      setTimeout(() => {
        try {
          expect(seenEvents).to.include('bypassed');
          expect(seenEvents).to.not.include('alarm');
          expect(sirenOn).to.equal(false);
          done();
        } catch (err) {
          done(err);
        }
      }, 250);
    }).catch(done);
  });

  it('accepts zones as a JSON array (formatted)', function (done) {
    const flowId = 'alarm4';
    const flow = [
      { id: flowId, type: 'tab', label: 'alarm4' },
      {
        id: 'alarm',
        type: 'AlarmSystemUltimate',
        z: flowId,
        controlTopic: 'alarm',
        exitDelaySeconds: 0.05,
        entryDelaySeconds: 0.05,
        sirenDurationSeconds: 0.05,
        sirenLatchUntilDisarm: false,
        requireCodeForDisarm: false,
        blockArmOnViolations: true,
        zones: JSON.stringify(
          [
            {
              id: 'front',
              name: 'Front',
              topic: 'sensor/frontdoor',
              type: 'perimeter',
              entry: true,
              modes: ['away', 'home', 'night'],
            },
          ],
          null,
          2
        ),
        wires: [['events'], ['siren']],
      },
      { id: 'events', type: 'helper', z: flowId },
      { id: 'siren', type: 'helper', z: flowId },
    ];

    loadAlarm(flow).then(() => {
      const alarm = helper.getNode('alarm');
      const events = helper.getNode('events');
      const siren = helper.getNode('siren');

      const received = { entry: false, alarm: false, sirenOn: false };

      function maybeDone() {
        if (received.entry && received.alarm && received.sirenOn) {
          done();
        }
      }

      events.on('input', (msg) => {
        try {
          if (msg.event === 'entry_delay') {
            received.entry = true;
          }
          if (msg.event === 'alarm') {
            received.alarm = true;
          }
          maybeDone();
        } catch (err) {
          done(err);
        }
      });

      siren.on('input', (msg) => {
        try {
          if (msg.event === 'siren_on') {
            received.sirenOn = true;
          }
          maybeDone();
        } catch (err) {
          done(err);
        }
      });

      alarm.receive({ topic: 'alarm', command: 'arm_away' });
      setTimeout(() => {
        alarm.receive({ topic: 'sensor/frontdoor', payload: 'open' });
      }, 80);
    }).catch(done);
  });
});
