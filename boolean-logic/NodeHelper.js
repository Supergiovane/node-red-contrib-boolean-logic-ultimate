// Licensed under the MIT license, see LICENSE file.
// Author: Per Malmberg (https://github.com/PerMalmberg)

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
			
	this.SetResult = function( value, optionalTopic ) {
		self.DisplayStatus( value );
		
		var msg = { 
			topic: optionalTopic === undefined ? "result" : optionalTopic,
			payload: value
		};

		myNode.send(msg);
	};
};
module.exports = NodeHelper;