

module.exports = function (RED) {
	function ImpulseUltimate(config) {
		RED.nodes.createNode(this, config);
		var node = this;
		node.commandText = config.commandText === undefined ? "" : config.commandText;
		node.name = config.name === undefined || config.name === "" ? "Impulse" : config.name;
		node.topic = node.name;
		node.commands = [];
		node.timerWait = null;
		node.isPlaying = false;

		node.setNodeStatus = ({ fill, shape, text }) => {
			var dDate = new Date();
			node.status({ fill: fill, shape: shape, text: text + " (" + dDate.getDate() + ", " + dDate.toLocaleTimeString() + ")" })
		}
		async function delay(ms) {
			return new Promise(function (resolve, reject) {
				try {
					node.timerWait = setTimeout(resolve, ms);
				} catch (error) {
					reject();
				}
			});
		}

		function isNumeric(str) {
			if (typeof str != "string") return false // we only process strings!  
			return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
				!isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
		}

		node.commands = node.commandText.split("\n");
		async function avvio() {
			node.isPlaying = true;
			node.setNodeStatus({ fill: "green", shape: "ring", text: "Start" });

			let msg = { topic: node.name };
			for (let index = 0; index < node.commands.length; index++) {
				const element = node.commands[index];
				if (!element.toString().startsWith("//")) {
					if (node.isPlaying === false) return; // STOP called
					try {
						var sCommand = element.split(":")[0].toString().toLowerCase().trim();
						var sVal = element.split(":")[1].toString().toLowerCase().trim();
					} catch (error) {
						node.isPlaying = false;
						node.setNodeStatus({ fill: "red", shape: "dot", text: "ERROR: check the row " + element });
						return;
					}
					node.setNodeStatus({ fill: "green", shape: "dot", text: sCommand + ":" + sVal });

					if (sCommand === "send") {
						try {
							if (sVal === "true") sVal = true;
							if (sVal === "false") sVal = false;
							msg.payload = sVal;
						} catch (error) {
						}
						node.send(msg);
					}

					if (sCommand === "wait") {
						// Wait
						try {
							if (!isNumeric(sVal)) throw (new error("Not number"));
							await delay(Number(sVal));
						} catch (error) {
							node.isPlaying = false;
							node.setNodeStatus({ fill: "red", shape: "dot", text: "ERROR: check the row " + element });
							return;
						}

					}
				}
			}
			node.isPlaying = false;
			node.setNodeStatus({ fill: "green", shape: "ring", text: "End" });
		}

		this.on('input', function (msg) {

			if (msg.payload === true) {
				if (node.isPlaying) {
					node.setNodeStatus({ fill: "yellow", shape: "ring", text: "Already running. Stop me first." });
					return;
				}
				avvio();

			} else if (msg.payload === false) {
				if (node.timerWait !== null) clearTimeout(node.timerWait);
				node.isPlaying = false;
				node.setNodeStatus({ fill: "red", shape: "dot", text: "Forced stop" });
			}

		});



		node.on("close", function (done) {
			done();
		});

	}

	RED.nodes.registerType("ImpulseUltimate", ImpulseUltimate);
}