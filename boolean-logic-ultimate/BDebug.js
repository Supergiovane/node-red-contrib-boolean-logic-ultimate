module.exports = function(RED) {
    function BDebug(config) {
        RED.nodes.createNode(this,config);
		this.config = config;
		var node = this;
		var NodeHelper = require('./NodeHelper.js');
		var h = new NodeHelper( node );
		
        this.on('input', function(msg) {
			var topic = msg.topic;
			var payload = msg.payload;
			
			if( topic !== undefined && payload !== undefined ) {
				h.DisplayStatus( h.ToBoolean( payload ) );
			}
        });

		h.DisplayUnkownStatus();
    }	
	
    RED.nodes.registerType("BDebug",BDebug);
}