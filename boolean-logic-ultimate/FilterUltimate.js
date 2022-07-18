module.exports = function (RED) {
	function FilterUltimate(config) {
		RED.nodes.createNode(this, config);
		this.config = config;
		var node = this;

		function setNodeStatus({ fill, shape, text }) {
			let dDate = new Date();
			node.status({ fill: fill, shape: shape, text: text + " (" + dDate.getDate() + ", " + dDate.toLocaleTimeString() + ")" })
		}


		setNodeStatus({ fill: "grey", shape: "dot", text: "Waiting" });
		this.on('input', function (msg) {

			const utils = require("./utils.js");
			let sPayload = utils.fetchFromObject(msg, config.payloadPropName || "payload");

			// 15/11/2021 inform user about undefined topic or payload
			if (sPayload=== undefined ) {
				setNodeStatus({ fill: "red", shape: "dot", text: "Received invalid payload from " + msg.topic || "" });
				return;
			}

			
			var bRes = null;
			try {
				bRes = utils.ToBoolean(sPayload);
			} catch (error) {
			}

			if (bRes === undefined || bRes === null) {
				setNodeStatus({ fill: "red", shape: "dot", text: "Received non convertible boolean value " + sPayload + " from " + msg.topic });
				return;
			}

			// 24/01/2020 Clone input message and replace only payload
			var msgOut = RED.util.cloneMessage(msg);
			msgOut.payload = bRes;

			if (bRes === true) {
				setNodeStatus({ fill: "green", shape: "dot", text: "(Send) true" });
				node.send([msgOut, null]);
			} else if (bRes === false) {
				setNodeStatus({ fill: "green", shape: "dot", text: "(Send) false" });
				node.send([null, msgOut]);
			}

		});

	}


	RED.nodes.registerType("FilterUltimate", FilterUltimate);
}