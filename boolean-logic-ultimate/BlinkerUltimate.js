module.exports = function (RED) {
	function BlinkerUltimate(config) {
		RED.nodes.createNode(this, config);
		this.config = config;
		var node = this;
		setNodeStatus({ fill: "grey", shape: "ring", text: "|| Off" });
		node.tBlinker = null;// Timer Blinker
		node.blinkfrequency = typeof config.blinkfrequency === "undefined" ? 500 : config.blinkfrequency;
		node.curPayload = false;

		node.on('input', function (msg) {

			if (msg.hasOwnProperty("payload")) {
				// 06/11/2019 
				if (ToBoolean(msg.payload) === true) {
					if (node.tBlinker !== null) clearInterval(node.tBlinker);
					node.tBlinker = setInterval(handleTimer, node.blinkfrequency); //  Start the timer that handles the queue of telegrams
					setNodeStatus({ fill: "green", shape: "dot", text: "-> On" });
				} else {
					if (node.tBlinker !== null) clearInterval(node.tBlinker);
					setNodeStatus({ fill: "red", shape: "dot", text: "|| Off" });
					node.send({ payload: false });
					node.curPayload = false;
 				}
			}
			if (msg.hasOwnProperty("interval")) {
				try {
					node.blinkfrequency = msg.interval;
				} catch (error) {
					node.blinkfrequency = 500;
					setNodeStatus({ fill: "red", shape: "dot", text: "Invalid interval received" });
				}
			}

		});

		node.on('close', function () {
			if (node.tBlinker !== null) clearInterval(node.tBlinker);
			node.send({ payload: false });
		});


		function setNodeStatus({ fill, shape, text }) {
			var dDate = new Date();
			node.status({ fill: fill, shape: shape, text: text + " (" + dDate.getDate() + ", " + dDate.toLocaleTimeString() + ")" })
		}


		function ToBoolean(value) {
			var res = false;

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


		function handleTimer() {
			node.curPayload = !node.curPayload;
			node.send({ payload: node.curPayload });
		}
	}


	RED.nodes.registerType("BlinkerUltimate", BlinkerUltimate);
}