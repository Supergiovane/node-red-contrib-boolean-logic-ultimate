module.exports = function (RED) {
	function SumUltimate(config) {
		RED.nodes.createNode(this, config);
		this.config = config;
		var node = this;
		node.math = config.math === undefined ? "sum" : config.math;
		node.topics = [];

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
				node.topics = [];
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
						if (node.topics.find(a => a.id === msg.topic.toString()) === undefined) {
							node.topics.push({ id: msg.topic.toString(), val: ret });
						}

						var quantita = 0;
						let somma = 0;
						if (node.math === "sum") {
							node.topics.forEach((item) => {
								somma += item.val;
								++quantita;
							});
							msg.payload = somma; // Sum
							msg.average = somma / quantita; // Average
							msg.measurements = quantita; // Topics	
						} else if (node.math === "multiply") {

							let moltiplicazione = 1;
							node.topics.forEach((item) => {
								if (item.val !== 0) {
									moltiplicazione *= item.val;
									++quantita;
								}
							});
							msg.payload = moltiplicazione; // Sum
							msg.average = moltiplicazione / quantita; // Average
							msg.measurements = quantita; // Topics	
						} else if (node.math === "subtract") {

							let risultato = node.topics[0].val;
							quantita = 1;
							for (let index = 1; index < node.topics.length; index++) {
								risultato -= node.topics[index].val;
								++quantita;
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