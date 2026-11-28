'use strict';

// Publishes the stateful Boolean Logic Ultimate nodes to Cerebrum Ultimate,
// read-only: Interrupt Flow, Presence Simulator, Staircase Light, Blinker and
// Railway Switch. Only nodes with a name are published: unnamed logic blocks
// mean nothing to a person or an AI model. One provider for the package,
// registered while at least one node is published.

const { registerCerebrumIntegration } = require('./cerebrumIntegration.js');

const PROVIDER_ID = 'boolean-logic-ultimate';
const published = new Map();
let integration = null;

const entityOf = (entry) => {
  let state = '';
  try { state = String(entry.read()); } catch (error) { state = 'unknown'; }
  return { id: entry.node.id, name: entry.node.name, type: entry.node.type, kind: entry.kind, capability: entry.capability, state, meaning: entry.meaning };
};

const ensureIntegration = (packageName) => {
  if (integration) return integration;
  integration = registerCerebrumIntegration({
    adapter: {
      id: 'boolean-logic-ultimate',
      title: 'Boolean Logic Ultimate',
      packageName,
      kind: 'logic',
      capabilities: ['logic-states'],
      access: 'observe',
      operations: [
        { id: 'list-entities', description: 'Named Boolean Logic Ultimate nodes that hold a state in the Node-RED flows: Interrupt Flow (passing or blocked), Presence Simulator (running or stopped), Staircase Light (on or off), Blinker (blinking or stopped), Railway Switch (number of the selected output). Each entry explains what its state means. Read-only.' },
        { id: 'read-entity', description: 'Current state of one Boolean Logic Ultimate node by its exact node id.' }
      ]
    },
    provider: {
      id: PROVIDER_ID,
      title: 'Boolean Logic Ultimate',
      isReady: () => true,
      listEntities: async () => Array.from(published.values()).map(entityOf),
      getEntity: async (id) => {
        const entry = published.get(String(id || ''));
        return entry ? entityOf(entry) : null;
      }
    }
  });
  return integration;
};

// node: the Node-RED node; read(): its current state as text.
// Returns refresh(), also called automatically on every node.status().
function publishLogicNode(node, { kind, capability = 'state', meaning = '', read, packageName = 'node-red-contrib-boolean-logic-ultimate' }) {
  const name = String((node && node.name) || '').trim();
  if (!name || typeof read !== 'function') return { refresh: () => {}, dispose: () => {} };
  const entry = { node, kind, capability, meaning, read };
  published.set(node.id, entry);
  const current = ensureIntegration(packageName);

  const refresh = () => {
    if (published.get(node.id) !== entry) return;
    const entity = entityOf(entry);
    current.emit({ entityId: node.id, state: entity.state, resourceName: name, resourceType: node.type, kind, capability, details: { meaning } });
  };

  const originalStatus = node.status;
  if (typeof originalStatus === 'function') {
    node.status = function (...args) {
      const result = originalStatus.apply(this, args);
      try { refresh(); } catch (error) { /* Cerebrum must never break the flow */ }
      return result;
    };
  }

  const dispose = () => {
    if (published.get(node.id) !== entry) return;
    published.delete(node.id);
    if (!published.size && integration) {
      integration.dispose();
      integration = null;
    }
  };
  if (typeof node.on === 'function') node.on('close', () => { try { dispose(); } catch (error) { /* ignore */ } });
  try { refresh(); } catch (error) { /* ignore */ }
  return { refresh, dispose };
}

module.exports = { publishLogicNode };
