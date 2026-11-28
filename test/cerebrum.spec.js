'use strict';

const path = require('path');
const { expect } = require('chai');
const { helper } = require('./helpers');
const { CEREBRUM_REGISTRY_KEY, getCerebrumRegistry } = require('../boolean-logic-ultimate/lib/cerebrumIntegration.js');

const nodeFiles = ['InterruptFlowUltimate', 'BlinkerUltimate', 'RailwaySwitchUltimate', 'StaircaseLightUltimate', 'PresenceSimulatorUltimate']
  .map((name) => require(path.join('..', 'boolean-logic-ultimate', `${name}.js`)));

const tick = () => new Promise((resolve) => setTimeout(resolve, 20));

describe('Cerebrum Ultimate publication', function () {
  this.timeout(5000);

  before(function (done) {
    delete globalThis[CEREBRUM_REGISTRY_KEY];
    helper.startServer(done);
  });

  after(function (done) {
    helper.stopServer(done);
  });

  afterEach(function () {
    return helper.unload();
  });

  it('publishes named stateful nodes read-only, follows their state and unregisters on close', async function () {
    const flowId = 'flow-cerebrum';
    const flow = [
      { id: flowId, type: 'tab', label: 'cerebrum' },
      { id: 'gate', type: 'InterruptFlowUltimate', z: flowId, name: 'Notifiche notturne', triggertopic: 'trigger', initializewith: '1', payloadPropName: 'payload', translatorConfig: '', x: 10, y: 10, wires: [[]] },
      { id: 'unnamed', type: 'InterruptFlowUltimate', z: flowId, name: '', triggertopic: 'trigger', initializewith: '1', payloadPropName: 'payload', translatorConfig: '', x: 10, y: 20, wires: [[]] },
      { id: 'rail', type: 'RailwaySwitchUltimate', z: flowId, name: 'Scenario', triggertopic: 'switcher', outputs: 3, initializewith: '0', payloadPropName: 'payload', translatorConfig: '', x: 10, y: 30, wires: [[], [], []] },
      { id: 'blink', type: 'BlinkerUltimate', z: flowId, name: 'Lampeggio sirena', blinkfrequency: 500, initializewith: '0', payloadPropName: 'payload', x: 10, y: 40, wires: [[], []] },
      { id: 'stairs', type: 'StaircaseLightUltimate', z: flowId, name: 'Luce scale', controlTopic: 'stairs', durationSeconds: 30, x: 10, y: 50, wires: [[], []] },
      { id: 'presence', type: 'PresenceSimulatorUltimate', z: flowId, name: 'Simulazione presenza', controlTopic: 'presence', patterns: '', x: 10, y: 60, wires: [[]] }
    ];
    await helper.load(nodeFiles, flow);
    const registry = getCerebrumRegistry();
    const provider = registry.providers.get('boolean-logic-ultimate');
    expect(provider).to.exist;
    expect(provider.callService).to.equal(undefined);
    expect(registry.adapters.get('boolean-logic-ultimate').operations.map((operation) => operation.id)).to.deep.equal(['list-entities', 'read-entity']);

    const entities = await provider.listEntities();
    expect(entities.map((entity) => [entity.id, entity.state])).to.deep.equal([
      ['gate', 'passing'],
      ['rail', '0'],
      ['blink', 'stopped'],
      ['stairs', 'off'],
      ['presence', 'stopped']
    ]);
    expect(entities[0]).to.include({ name: 'Notifiche notturne', kind: 'flow_gate', type: 'InterruptFlowUltimate' });

    const events = [];
    const unsubscribe = provider.subscribe((event) => events.push(event));
    helper.getNode('gate').receive({ topic: 'trigger', payload: false });
    helper.getNode('rail').receive({ topic: 'switcher', payload: '2' });
    helper.getNode('blink').receive({ payload: true });
    helper.getNode('blink').receive({ payload: false });
    await tick();
    expect(events.map((event) => [event.entityId, event.state])).to.deep.equal([
      ['gate', 'blocked'],
      ['rail', '2'],
      ['blink', 'blinking'],
      ['blink', 'stopped']
    ]);
    expect((await provider.getEntity('gate')).state).to.equal('blocked');
    expect(await provider.getEntity('unnamed')).to.equal(null);
    unsubscribe();

    await helper.unload();
    expect(registry.providers.has('boolean-logic-ultimate')).to.equal(false);
    expect(registry.adapters.has('boolean-logic-ultimate')).to.equal(false);
  });
});
