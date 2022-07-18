module.exports = function (RED) {
	function toggleUltimate(config) {
		RED.nodes.createNode(this, config);
		this.config = config;
		var node = this;
		const utils = require("./utils.js");
		node.valueToToggle = config.valueToToggle === undefined ? true : utils.ToBoolean(config.valueToToggle);

		function setNodeStatus({ fill, shape, text }) {
			let dDate = new Date();
			node.status({ fill: fill, shape: shape, text: text + " (" + dDate.getDate() + ", " + dDate.toLocaleTimeString() + ")" })
		}

		setNodeStatus({ fill: "grey", shape: "dot", text: "Waiting" });

		this.on('input', function (msg) {

			const utils = require("./utils.js");
			let sPayload = utils.fetchFromObject(msg, config.payloadPropName || "payload");

			// 15/11/2021 inform user about undefined topic or payload
			if (sPayload === undefined ) {
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


	}



	RED.nodes.registerType("toggleUltimate", toggleUltimate);
}