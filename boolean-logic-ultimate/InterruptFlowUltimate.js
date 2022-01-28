module.exports = function (RED) {
	function InterruptFlowUltimate(config) {
		RED.nodes.createNode(this, config);
		this.config = config;
		var node = this;
		node.currentMsg = {}; // Stores current payload
		node.sTriggerTopic = node.config.triggertopic.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '') || "trigger"; // Topic controlling the bInviaMessaggio
		node.bInviaMessaggio = (node.config.initializewith === undefined || node.config.initializewith === "1") ? true : false; // Send the message or not
		node.autoToggle = config.autoToggle === undefined ? 0 : parseInt(config.autoToggle); // Auto toggle the selected "initializewith" after a while (useful for homekit bridged, that sends junk after start)
		node.timerAutoToggle = null;

		function setNodeStatus({ fill, shape, text }) {
			var dDate = new Date();
			node.status({ fill: fill, shape: shape, text: text + " (" + dDate.getDate() + ", " + dDate.toLocaleTimeString() + ")" })
		}
		setNodeStatus({ fill: "green", shape: "ring", text: "-> pass" });


		node.alignStatus = () => {
			let sAutoToggle = node.autoToggle > 0 ? " (Autotoggle in " + node.autoToggle + "s)" : "";
			if (node.bInviaMessaggio) {
				setNodeStatus({ fill: "green", shape: "dot", text: "-> pass" + sAutoToggle });
			} else {
				setNodeStatus({ fill: "red", shape: "dot", text: "|| stop" + sAutoToggle });
			}
		}

		if (node.autoToggle > 0) {
			node.timerAutoToggle = setTimeout(() => {
				node.autoToggle = 0;
				node.bInviaMessaggio = !node.bInviaMessaggio;
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

					if (msg.hasOwnProperty("play")) {
						node.currentMsg.isReplay = true;
						setNodeStatus({ fill: "yellow", shape: "dot", text: "-> replay" });
						// Restore previous status
						setTimeout(() => {
							if (node.bInviaMessaggio) {
								setNodeStatus({ fill: "green", shape: "dot", text: "-> pass" });
							} else {
								setNodeStatus({ fill: "red", shape: "dot", text: "|| stop (stored last msg)" });
							}
						}, 1000)
						node.send(node.currentMsg);
						return;
					} else if (msg.payload === true) {
						node.bInviaMessaggio = true;
						setNodeStatus({ fill: "green", shape: "dot", text: "-> pass" });
						return;
					} else if (msg.payload === false) {
						node.bInviaMessaggio = false;
						setNodeStatus({ fill: "red", shape: "dot", text: "|| stop (stored last msg)" });
						return;
					}
				}
			}
			if (node.bInviaMessaggio) {
				node.currentMsg = msg;
				node.send(msg);
			}
		});




		function ToBoolean(value) {
			var res = false;
			var decimal = /^\s*[+-]{0,1}\s*([\d]+(\.[\d]*)*)\s*$/

			if (typeof value === 'boolean') {
				res = value;
			}
			else if (typeof value === 'number' || typeof value === 'string') {

				if (typeof value === "string" && value.toLowerCase() === "on") return true;
				if (typeof value === "string" && value.toLowerCase() === "off") return false;

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


	RED.nodes.registerType("InterruptFlowUltimate", InterruptFlowUltimate);
}