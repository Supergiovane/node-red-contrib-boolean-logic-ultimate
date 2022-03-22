module.exports = function (RED) {
	function toggleUltimate(config) {
		RED.nodes.createNode(this, config);
		this.config = config;
		var node = this;
		node.valueToToggle = config.valueToToggle === undefined ? true : ToBoolean(config.valueToToggle);

		function setNodeStatus({ fill, shape, text }) {
			let dDate = new Date();
			node.status({ fill: fill, shape: shape, text: text + " (" + dDate.getDate() + ", " + dDate.toLocaleTimeString() + ")" })
		}

		setNodeStatus({ fill: "grey", shape: "dot", text: "Waiting" });

		this.on('input', function (msg) {


			// 15/11/2021 inform user about undefined topic or payload
			if (!msg.hasOwnProperty("payload") || msg.payload === undefined || msg.payload === null) {
				setNodeStatus({ fill: "red", shape: "dot", text: "Received invalid payload from " + msg.topic || "" });
				return;
			}

			node.valueToToggle = !node.valueToToggle;
			
			let msgOUT = RED.util.cloneMessage(msg);
			try {
				msgOUT.payload = node.valueToToggle;
				setNodeStatus({ fill: "green", shape: "dot", text: "(Send) " + msgOUT.payload });
				node.send(msgOUT);
			} catch (error) {
				setNodeStatus({ fill: "red", shape: "dot", text: "Unable to invert the input payload " + bRes });
			}

		});



		function ToBoolean(value) {
			let res = false;
			let decimal = /^\s*[+-]{0,1}\s*([\d]+(\.[\d]*)*)\s*$/

			if (typeof value === 'boolean') {
				res = value;
			}
			else if (typeof value === 'number' || typeof value === 'string') {

				if (typeof value === "string" && value.toLowerCase() === "on") return true;
				if (typeof value === "string" && value.toLowerCase() === "off") return false;

				// Is it formated as a decimal number?
				if (decimal.test(value)) {
					res = parseFloat(value) != 0;
				}
				else {
					res = value.toLowerCase() === "true";
				}
			}

			return res;
		};



	}



	RED.nodes.registerType("toggleUltimate", toggleUltimate);
}