module.exports = function (RED) {
	function SumUltimate(config) {
		RED.nodes.createNode(this, config);
		this.config = config;
		var node = this;
		node.math = config.math === undefined ? "sum" : config.math;
		this.topics = {};

		function setNodeStatus({ fill, shape, text }) {
			let dDate = new Date();
			node.status({ fill: fill, shape: shape, text: text + " (" + dDate.getDate() + ", " + dDate.toLocaleTimeString() + ")" })
		}

		setNodeStatus({ fill: "grey", shape: "dot", text: "" });

		function fetchFromObject(obj, prop) {

			if (obj === undefined) {
				return undefined;
			}

			var _index = prop.indexOf('.')
			if (_index > -1) {
				return fetchFromObject(obj[prop.substring(0, _index)], prop.substr(_index + 1));
			}

			return obj[prop];
		}

		this.on('input', function (msg) {

			// handle reset
			if (msg.hasOwnProperty("reset")) {
				node.topics = {};
				setNodeStatus({ fill: "grey", shape: "ring", text: "Reset" });
				return;
			}

			if (!msg.hasOwnProperty("topic")) {
				setNodeStatus({ fill: "red", shape: "ring", text: "Incoming msg without topic! Please set the topic." });
				return;
			}

			try {
				let props = [] = this.config.property.split(".");
				let ret = fetchFromObject(msg, this.config.property);
				if (ret !== undefined) {

					ret = Number(ret);

					// Sum
					if (!isNaN(ret) && isFinite(ret)) {
						node.topics[msg.topic.toString()] = ret;

						var quantita = 0;

						if (node.math === "sum") {
							let somma = Object.keys(node.topics).reduce(function (a, b) {
								++quantita;
								return a + node.topics[b];
							}, 0);
							msg.payload = somma; // Sum
							msg.average = somma / quantita; // Average
							msg.measurements = quantita; // Topics	
						} else if (node.math === "multiply") {
							let moltiplicazione = Object.keys(node.topics).reduce(function (a, b) {
								try {
									++quantita;
									return (a > 0 ? a : 1) * node.topics[b]; // Avoid returning zero everytime	
								} catch (error) {
									setNodeStatus({ fill: "red", shape: "ring", text: "Error " + error.message });
									return 0;
								}
							}, 0);
							msg.payload = moltiplicazione; // Sum
							msg.average = undefined; // Average
							msg.measurements = quantita; // Topics	
						} else if (node.math === "subtract") {
							let values = []
							for (let row in node.topics) {
								if (node.topics.hasOwnProperty(row)) {
									++quantita;
									values.push(node.topics[row]);
								}
							}
							function orderReverseNumbers(a, b) {
								return b - a;
							}
							values.sort(orderReverseNumbers)
							let risultato = values[0]
							for (let index = 1; index < values.length; index++) {
								risultato -= values[index];
							}
							msg.payload = risultato; // Sum
							msg.average = risultato / quantita; // Average
							msg.measurements = quantita; // Topics	
						}

						// overwrite topic if configured
						if (config.name) {
							msg.topic = config.name;
						}
					}

					// everything else
					else {
						setNodeStatus({ fill: "red", shape: "ring", text: "Not a number" });
					}

				} else {
					setNodeStatus({ fill: "red", shape: "ring", text: this.config.property + " is undefined." });
				}
			} catch (error) {
				setNodeStatus({ fill: "red", shape: "ring", text: error.message });
			}
			setNodeStatus({ fill: "green", shape: "dot", text: "Sum " + msg.payload });
			node.send(msg);
		});

	}

	RED.nodes.registerType("SumUltimate", SumUltimate);
}