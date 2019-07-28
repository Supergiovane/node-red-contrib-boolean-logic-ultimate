// Licensed under the MIT license, see LICENSE file.
// Author: Per Malmberg (https://github.com/PerMalmberg)
module.exports = function(RED) {
    function Invert(config) {
        RED.nodes.createNode(this,config);
		this.config = config;
		var node = this;
		var NodeHelper = require('./NodeHelper.js');
		var h = new NodeHelper( node );
		
        this.on('input', function(msg) {
			var topic = msg.topic;
			var payload = msg.payload;
			
			if( topic !== undefined && payload !== undefined ) {
				h.SetResult( !h.ToBoolean( payload ), topic );
			}
        });
		
		h.DisplayUnkownStatus();
    }	
	
	
    RED.nodes.registerType("Invert",Invert);
}