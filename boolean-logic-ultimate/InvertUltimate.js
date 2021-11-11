module.exports = function (RED) {
	function InvertUltimate(config) {
		RED.nodes.createNode(this, config);
		this.config = config;
		var node = this;


		function setNodeStatus({ fill, shape, text }) {
			var dDate = new Date();
			node.status({ fill: fill, shape: shape, text: text + " (" + dDate.getDate() + ", " + dDate.toLocaleTimeString() + ")" })
		}

		setNodeStatus({ fill: "grey", shape: "dot", text: "Waiting" });

		this.on('input', function (msg) {

			if (msg.hasOwnProperty("payload") && msg.payload !== undefined && msg.payload !== null) {

				// 11/11/2021 Clone input message and replace only relevant topics

				var bRes = null;
				try {
					bRes = ToBoolean(msg.payload);
				} catch (error) {
				}
				if (bRes === undefined || bRes === null) {
					setNodeStatus({ fill: "red", shape: "dot", text: "Received non convertible boolean value " + msg.payload + " from " + msg.topic });
					return;
				}

				var msgOUt = RED.util.cloneMessage(msg);
				try {
					msgOUt.payload = !bRes;
					setNodeStatus({ fill: "green", shape: "dot", text: "(Send) " + msgOUt.payload });
					node.send(msgOUt);
				} catch (error) {
					setNodeStatus({ fill: "red", shape: "dot", text: "Unable to invert the input payload " + bRes });
				}

			} else {
				setNodeStatus({ fill: "red", shape: "dot", text: "No payload from " + msg.topic });
			}
		});



		function ToBoolean(value) {
			var res = false;
			var decimal = /^\s*[+-]{0,1}\s*([\d]+(\.[\d]*)*)\s*$/

			if (typeof value === 'boolean') {
				res = value;
			}
			else if (typeof value === 'number' || typeof value === 'string') {
				// Is it formated as a decimal number?
				if (decimal.test(value)) {
					var v = parseFloat(value);
					res = v != 0;
				}
				else {
					res = value.toLowerCase() === "true";
				}
			}

			return res;
		};



	}



	RED.nodes.registerType("InvertUltimate", InvertUltimate);
}