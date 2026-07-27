'use strict';

const { expect } = require('chai');
const { helper } = require('./helpers');

const injectNode = require('../boolean-logic-ultimate/InjectUltimate.js');

describe('InjectUltimate node', function () {
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

  it('uses false and the first six node ID characters in the default topic and JSON output', function (done) {
    const flowId = 'inject-flow';
    const flow = [
      { id: flowId, type: 'tab', label: 'inject-flow' },
      {
        id: 'inject-node-id',
        type: 'InjectUltimate',
        z: flowId,
        x: 100,
        y: 100,
        wires: [[], [], [], ['out']],
      },
      { id: 'out', type: 'helper', z: flowId, x: 300, y: 100 },
    ];

    helper.load(injectNode, flow).then(() => {
      const inject = helper.getNode('inject-node-id');
      const out = helper.getNode('out');

      expect(inject.topic).to.equal('inject');

      out.on('input', (msg) => {
        try {
          expect(msg).to.include({
            payload: false,
            topic: 'inject',
          });
          done();
        } catch (error) {
          done(error);
        }
      });

      inject.buttonpressed();
    }).catch(done);
  });
});
