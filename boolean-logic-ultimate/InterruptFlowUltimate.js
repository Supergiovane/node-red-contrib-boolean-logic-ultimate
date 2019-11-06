module.exports = function(RED) {
    function InterruptFlowUltimate(config) {
        RED.nodes.createNode(this,config);
		this.config = config;
		var node = this;
        setNodeStatus({ fill: "green", shape: "ring", text: "-> pass" });
        node.bInviaMessaggio = true; // Send the message or not
		this.on('input', function (msg) {
            
            var sTriggerTopic = node.config.triggertopic || "trigger"; // Topic controlling the bInviaMessaggio
            
            if (msg.hasOwnProperty("topic")) {
                // 06/11/2019 
                if (msg.topic==sTriggerTopic && ToBoolean(msg.payload)===true) {
                    node.bInviaMessaggio = true;
                    setNodeStatus({ fill: "green", shape: "dot", text: "-> pass" });
                    return;
                } else if (msg.topic==sTriggerTopic && ToBoolean(msg.payload)===false){
                    node.bInviaMessaggio = false;
                    setNodeStatus({ fill: "red", shape: "dot", text: "|| stop" });
                    return;
                }	
            }
            if (node.bInviaMessaggio) node.send(msg);
        });
		
		function setNodeStatus({fill, shape, text})
		{
			var dDate = new Date();
			node.status({fill: fill,shape: shape,text: text + " (" + dDate.getDate() + ", " + dDate.toLocaleTimeString() + ")"})
		}
			

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
	

    RED.nodes.registerType("InterruptFlowUltimate",InterruptFlowUltimate);
}