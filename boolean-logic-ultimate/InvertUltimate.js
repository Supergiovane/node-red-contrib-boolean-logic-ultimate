module.exports = function(RED) {
    function InvertUltimate(config) {
        RED.nodes.createNode(this,config);
		this.config = config;
		var node = this;
		node.status( {fill:  "grey" ,shape: "dot" ,text: "waiting"});
		
        this.on('input', function(msg) {
			var topic = msg.topic || "";
			var payload = msg.payload;
			if (topic !== undefined && payload !== undefined) {
				node.status( {fill:  "green" ,shape: "dot" ,text: !ToBoolean(payload)});
				node.send({ topic: topic, payload: !ToBoolean(payload) });
				return;
			}
        });
		
		

		function ToBoolean( value ) {
			var res = false;
	
			if (typeof value === 'boolean') {
				res = value;
			} 
			else if( typeof value === 'number' || typeof value === 'string' ) {
				// Is it formated as a decimal number?
				if( decimal.test( value ) ) {
					var v = parseFloat( value );
					res = v != 0;
				}
				else {
					res = value.toLowerCase() === "true";
				}
			}
			
			return res;
		};
    }	
	
	
    RED.nodes.registerType("InvertUltimate",InvertUltimate);
}