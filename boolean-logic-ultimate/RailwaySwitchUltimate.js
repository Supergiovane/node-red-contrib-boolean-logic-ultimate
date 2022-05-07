module.exports = function (RED) {
	function RailwaySwitchUltimate(config) {
		RED.nodes.createNode(this, config);
		this.config = config;
		var node = this;
		node.currentMsg = {}; // Stores current payload
		node.sTriggerTopic = node.config.triggertopic.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '') || "trigger"; // Topic controlling the iRailway
		node.iRailway = Number(node.config.initializewith); // Railway selector
		node.autoToggle = config.autoToggle === undefined ? 0 : parseInt(config.autoToggle); // Auto toggle the selected "initializewith" after a while (useful for homekit bridged, that sends junk after start)
		node.timerAutoToggle = null;

		function setNodeStatus({ fill, shape, text }) {
			let dDate = new Date();
			node.status({ fill: fill, shape: shape, text: text + " (" + dDate.getDate() + ", " + dDate.toLocaleTimeString() + ")" })
		}

		node.alignStatus = () => {
			let sAutoToggle = node.autoToggle > 0 ? " (Autotoggle in " + node.autoToggle + "s)" : "";
			if (node.iRailway === 0) {
				setNodeStatus({ fill: "green", shape: "dot", text: "-> UPPER PIN" + sAutoToggle });
			} else {
				setNodeStatus({ fill: "blue", shape: "dot", text: "-> LOWER PIN" + sAutoToggle });
			}
		}

		if (node.autoToggle > 0) {
			node.timerAutoToggle = setTimeout(() => {
				node.autoToggle = 0;
				node.iRailway === 0 ? node.iRailway = 1 : node.iRailway = 0;
				node.alignStatus();
			}, node.autoToggle * 1000);
		}

		node.alignStatus();

		this.on('input', function (msg) {
			var sIncomingTopic = "";
			if (msg.hasOwnProperty("topic")) {
				// 06/11/2019 
				if (!msg.hasOwnProperty("topic") || msg.topic === undefined) msg.topic = "NoTopicReceived";
				sIncomingTopic = msg.topic.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ''); // Cut unwanted Characters
				if (sIncomingTopic === node.sTriggerTopic) {

					// 15/11/2021 inform user about undefined topic or payload
					if (!msg.hasOwnProperty("payload") || msg.payload === undefined || msg.payload === null) {
						setNodeStatus({ fill: "red", shape: "dot", text: "Received invalid payload from " + msg.topic || "" });
						return;
					}

					msg.payload = ToBoolean(msg.payload); // 15/11/2021 Convert input to boolean.

					// 28/01/2022 Stop autotoggle
					if (node.timerAutoToggle !== null) clearInterval(node.timerAutoToggle);

					if (msg.payload === false) node.iRailway = 0;
					if (msg.payload === true) node.iRailway = 1;
					if (node.iRailway === 0) {
						setNodeStatus({ fill: "green", shape: "dot", text: "-> UPPER PIN" });
					} else {
						setNodeStatus({ fill: "blue", shape: "dot", text: "-> LOWER PIN" });
					}
					return; // DONT'S SEND THIS MESSAGE
				}
			}
			node.currentMsg = RED.util.cloneMessage(msg);
			if (node.iRailway === 0) {
				node.send([msg, null]);
			} else {
				node.send([null, msg]);
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


	RED.nodes.registerType("RailwaySwitchUltimate", RailwaySwitchUltimate);
}