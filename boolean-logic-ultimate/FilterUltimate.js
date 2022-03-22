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

			// 15/11/2021 inform user about undefined topic or payload
			if (!msg.hasOwnProperty("payload") || msg.payload === undefined || msg.payload === null) {
				setNodeStatus({ fill: "red", shape: "dot", text: "Received invalid payload from " + msg.topic || "" });
				return;
			}

			var bRes = null;
			try {
				bRes = ToBoolean(msg.payload);
			} catch (error) {
			}

			if (bRes === undefined || bRes === null) {
				setNodeStatus({ fill: "red", shape: "dot", text: "Received non convertible boolean value " + msg.payload + " from " + msg.topic });
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


	RED.nodes.registerType("FilterUltimate", FilterUltimate);
}