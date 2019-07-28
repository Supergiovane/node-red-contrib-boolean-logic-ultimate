module.exports = function(RED) {
    function BooleanLogicUltimate(config) {
        RED.nodes.createNode(this,config);
		this.config = config;
        this.state = {};
		var node = this;
		var NodeHelper = require('./NodeHelper.js');
		var fs = require('fs');
		var h = new NodeHelper(node);
		
		// Delete persistent states on change/deploy
		DeletePersistFile();

		// Populate the state array with the persisten file
		if (this.config.persist == true) {
			try {
				var contents = fs.readFileSync(node.id.toString()).toString();
				if (typeof contents !== 'undefined') {
					node.state = JSON.parse(contents);
					node.status({fill: "blue",shape: "ring",text: "Loaded persistent states (" + Object.keys(this.state).length + " total)."});
				}
			} catch (error) {
				node.status({fill: "grey",shape: "ring",text: "No persistent states"});
			}
			
		} else {
			node.status({fill: "yellow",shape: "dot",text: "Waiting for input states"});
		}

		this.on('input', function (msg) {
			
			var topic = msg.topic;
			var payload = msg.payload;
			
			if (topic !== undefined && payload !== undefined) {
				
				var value = h.ToBoolean( payload );
				var state = node.state;
				
				state[topic] = value;

				// Sabe the state array to a perisistent file
				if (this.config.persist == true) { 
					fs.writeFileSync(this.id.toString(),JSON.stringify(state));
				}
								
				// Do we have as many inputs as we expect?
				var keyCount = Object.keys(state).length;

				if( keyCount == node.config.inputCount ) {
					
					var resAND = CalculateResult("AND");
					var resOR = CalculateResult("OR");
					var resXOR = CalculateResult("XOR");

					if (this.config.filtertrue == "onlytrue") {
						if (!resAND) { resAND = null };
						if (!resOR) { resOR = null };
						if (!resXOR) { resXOR = null };
					}
					h.SetResult(resAND,resOR,resXOR, node.config.topic);
				}
				else if(keyCount > node.config.inputCount ) {
					node.warn( 
						(node.config.name !== undefined && node.config.name.length > 0 
							? node.config.name : "BooleanLogicUltimate") 
							+ " [Logic]: More than the specified " 
							+ node.config.inputCount + " topics received, resetting. Will not output new value until " + node.config.inputCount + " new topics have been received.");
					node.state = {};
					h.DisplayUnkownStatus();
				}
			}
        });
		
		function DeletePersistFile (){
			// Detele the persist file
			try {
				fs.unlinkSync(node.id.toString());
				node.status({fill: "red",shape: "ring",text: "Persistent states deleted."});
			} catch (error) {
				node.status({fill: "red",shape: "ring",text: "Error deleting persistent file: " + error.toString()});
			}
		}

		function CalculateResult(_operation) {
			var res;
			
			if( _operation == "XOR") {
				res = PerformXOR();
			}
			else {
				// We need a starting value to perform AND and OR operations.				
				var keys = Object.keys(node.state);
				res = node.state[keys[0]];
				
				for( var i = 1; i < keys.length; ++i ) {
					var key = keys[i];
					res = PerformSimpleOperation( _operation, res, node.state[key] );
				}
			}
			
			return res;			
		}		
		
		function PerformXOR()
		{
			// XOR = exclusively one input is true. As such, we just count the number of true values and compare to 1.
			var trueCount = 0;
			
			for( var key in node.state ) {
				if( node.state[key] ) {
					trueCount++;
				}
			}
			
			return trueCount == 1;
		}
		
		function PerformSimpleOperation( operation, val1, val2 ) {
			var res;
			
			if( operation === "AND" ) {
				res = val1 && val2;
			}
			else if( operation === "OR" ) {
				res = val1 || val2;
			}
			else {
				node.error( "Unknown operation: " + operation );
			}
			
			return res;
		}
		
		
    }	
	
    RED.nodes.registerType("BooleanLogicUltimate",BooleanLogicUltimate);
}