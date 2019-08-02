module.exports = function(RED) {
    function BooleanLogicUltimate(config) {
        RED.nodes.createNode(this,config);
		this.config = config;
        this.state = {};
		var node = this;
		var fs = require('fs');
		var decimal = /^\s*[+-]{0,1}\s*([\d]+(\.[\d]*)*)\s*$/
	
		
		// Helper for the config html, to be able to delete the peristent states file
		RED.httpAdmin.get("/stateoperation_delete", RED.auth.needsPermission('BooleanLogicUltimate.read'), function (req, res) {
			//node.send({ req: req });
			DeletePersistFile(req.query.nodeid);
			res.json({ status: 220 });
		});

		// Populate the state array with the persisten file
		if (node.config.persist == true) {
			try {
				var contents = fs.readFileSync("states/" + node.id.toString()).toString();
				if (typeof contents !== 'undefined') {
					node.state = JSON.parse(contents);
					node.status({fill: "blue",shape: "ring",text: "Loaded persistent states (" + Object.keys(node.state).length + " total)."});
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
				
				var value = ToBoolean( payload );
				var state = node.state;
				
				state[topic] = value;

				// Save the state array to a perisistent file
				if (this.config.persist == true) { 
					try {
						if (!fs.existsSync("states")) fs.mkdirSync("states");
						fs.writeFileSync("states/" + node.id.toString(),JSON.stringify(state));
	
					} catch (error) {
						node.status({fill: "red",shape: "dot",text: "Node cannot write to filesystem: " + error});
					}
				}
								
				// Do we have as many inputs as we expect?
				var keyCount = Object.keys(state).length;

				if( keyCount == node.config.inputCount ) {
					
					var resAND = CalculateResult("AND");
					var resOR = CalculateResult("OR");
					var resXOR = CalculateResult("XOR");

					if (node.config.filtertrue == "onlytrue") {
						if (!resAND) { resAND = null };
						if (!resOR) { resOR = null };
						if (!resXOR) { resXOR = null };
					}
					SetResult(resAND,resOR,resXOR, node.config.topic);
				}
				else if(keyCount > node.config.inputCount ) {
					node.warn( 
						(node.config.name !== undefined && node.config.name.length > 0 
							? node.config.name : "BooleanLogicUltimate") 
							+ " [Logic]: More than the specified " 
							+ node.config.inputCount + " topics received, resetting. Will not output new value until " + node.config.inputCount + " new topics have been received.");
					node.state = {};
					DeletePersistFile(node.id);
					DisplayUnkownStatus();
				} else {
					node.status({ fill: "green", shape: "ring", text: " Arrived topic " + keyCount + " of " + node.config.inputCount});
				}
			}
		});
		
		this.on('close', function(removed, done) {
			if (removed) {
				// This node has been deleted
				// Delete persistent states on change/deploy
				DeletePersistFile(node.id);
			} else {
				// This node is being restarted
			}
			done();
		});

		function DeletePersistFile (_nodeid){
			// Detele the persist file
			var _node = RED.nodes.getNode(_nodeid); // Gets node object from nodeit, because when called from the config html, the node object is not defined
			try {
				fs.unlinkSync("states/" + _nodeid.toString());
				_node.status({fill: "red",shape: "ring",text: "Persistent states deleted ("+_nodeid.toString()+")."});
			} catch (error) {
				_node.status({fill: "red",shape: "ring",text: "Error deleting persistent file: " + error.toString()});
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
		
		function DisplayStatus ( value ) {
			node.status( 
				{ 
					fill: value ? "green" : "red", 
					shape: value ? "dot" : "ring", 
					text: value ? "true" : "false" 
				}
			);
		};

		function DisplayUnkownStatus () {
			node.status( 
				{ 
					fill: "gray", 
					shape: "ring", 
					text: "Reset due to unexpected new topic" 
				});
		};

		function SetResult(_valueAND, _valueOR, _valueXOR, optionalTopic) {
			node.status({fill: "green",shape: "dot",text: "(AND)" + _valueAND + " (OR)" +_valueOR + " (XOR)" +_valueXOR});
			
			if (_valueAND!=null){
				var msgAND = { 
					topic: optionalTopic === undefined ? "result" : optionalTopic,
					operation:"AND",
					payload: _valueAND
				};
			}
			if (_valueOR!=null){
				var msgOR = { 
					topic: optionalTopic === undefined ? "result" : optionalTopic,
					operation:"OR",
					payload: _valueOR
				};
			}
			if (_valueXOR!=null){
				var msgXOR = { 
					topic: optionalTopic === undefined ? "result" : optionalTopic,
					operation:"XOR",
					payload: _valueXOR
				};
			}
			node.send([msgAND,msgOR,msgXOR]);
		};
    }	
	
    RED.nodes.registerType("BooleanLogicUltimate",BooleanLogicUltimate);
}