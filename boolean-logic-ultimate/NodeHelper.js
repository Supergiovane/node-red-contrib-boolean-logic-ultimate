var NodeHelper = function( node ) {
	var myNode = node;
	var self = this;
	var decimal = /^\s*[+-]{0,1}\s*([\d]+(\.[\d]*)*)\s*$/
	
	
	this.ToBoolean = function( value ) {
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

	this.DisplayStatus = function( value ) {
		myNode.status( 
			{ 
				fill: value ? "green" : "red", 
				shape: value ? "dot" : "ring", 
				text: value ? "true" : "false" 
			}
		);
	};
	
	this.DisplayUnkownStatus = function() {
		myNode.status( 
			{ 
				fill: "gray", 
				shape: "dot", 
				text: "Unknown" 
			});
	};
			
	this.SetResult = function( _valueAND, _valueOR, _valueXOR, optionalTopic ) {
		self.DisplayStatus( "AND:" + _valueAND + " OR:" +_valueOR + " XOR:" +_valueXOR);
		
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
		myNode.send([msgAND,msgOR,msgXOR]);
	};
};
module.exports = NodeHelper;