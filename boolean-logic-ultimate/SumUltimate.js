module.exports = function (RED) {
	function SumUltimate(config) {
		RED.nodes.createNode(this, config);
		this.config = config;
		var node = this;
		node.math = config.math === undefined ? "sum" : config.math;
		node.subtractstartfrom = config.subtractstartfrom === undefined ? "" : config.subtractstartfrom;
		node.delay = Number(config.delay) > 0 ? Number(config.delay) : 0;
		node.delayTimer = null;
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

		// Computes the result on the stored topics and sends it, using msg as base.
		function computeAndSend(msg) {
			var quantita = 0;
			if (node.math === "sum") {
				let somma = 0;
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
					moltiplicazione *= item.val;
					++quantita;
				});
				msg.payload = moltiplicazione; // Sum
				msg.average = moltiplicazione / quantita; // Average
				msg.measurements = quantita; // Topics	
			} else if (node.math === "subtract") {
				let risultato = 0;
				if (node.subtractstartfrom !== "") {
					let oStart = node.topics.find(m => m.id === node.subtractstartfrom);
					if (oStart === undefined) {
						setNodeStatus({ fill: "grey", shape: "ring", text: "Waiting for " + node.subtractstartfrom + " (topics " + node.topics.length + ")" });
						return;
					}
					risultato = oStart.val;
				} else {
					setNodeStatus({ fill: "red", shape: "ring", text: "Please specify the topic form subtract to." });
					return;
				}
				quantita = 1;
				for (let index = 0; index < node.topics.length; index++) {
					if (node.topics[index].id !== node.subtractstartfrom) {
						risultato -= node.topics[index].val;
						++quantita;
					}
				}
				msg.payload = risultato; // Sum
				msg.average = risultato / quantita; // Average
				msg.measurements = quantita; // Topics	
			}
			// overwrite topic if configured
			if (config.name) {
				msg.topic = config.name;
			}
			setNodeStatus({ fill: "green", shape: "dot", text: node.math + " " + msg.payload + " (topics " + node.topics.length + ")" });
			node.send(msg);
		}

		function clearDelayTimer() {
			if (node.delayTimer !== null) {
				clearTimeout(node.delayTimer);
				node.delayTimer = null;
			}
		}

		this.on('input', function (msg) {

			// handle reset
			if (msg.hasOwnProperty("reset")) {
				clearDelayTimer();
				node.topics = [];
				setNodeStatus({ fill: "grey", shape: "ring", text: "Reset" });
				return;
			}

			if (!msg.hasOwnProperty("topic")) {
				setNodeStatus({ fill: "red", shape: "ring", text: "Incoming msg without topic! Please set the topic." });
				return;
			}

			try {
				let ret = fetchFromObject(msg, this.config.property);
				if (ret === undefined) {
					setNodeStatus({ fill: "red", shape: "ring", text: this.config.property + " is undefined." });
					return;
				}

				ret = Number(ret);
				if (isNaN(ret) || !isFinite(ret)) {
					setNodeStatus({ fill: "red", shape: "ring", text: "Not a number" });
					return;
				}

				let oFound = node.topics.find(a => a.id === msg.topic.toString());
				if (oFound === undefined) {
					node.topics.push({ id: msg.topic.toString(), val: ret });
				} else {
					oFound.val = ret;
				}

				if (node.delay > 0) {
					// Wait until no new values arrive for node.delay ms, then send the result once.
					clearDelayTimer();
					setNodeStatus({ fill: "blue", shape: "ring", text: "Waiting " + node.delay + "ms (topics " + node.topics.length + ")" });
					node.delayTimer = setTimeout(() => {
						node.delayTimer = null;
						try {
							computeAndSend(msg);
						} catch (error) {
							setNodeStatus({ fill: "red", shape: "ring", text: error.message });
						}
					}, node.delay);
				} else {
					computeAndSend(msg);
				}
			} catch (error) {
				setNodeStatus({ fill: "red", shape: "ring", text: error.message });
			}
		});

		this.on('close', function () {
			clearDelayTimer();
		});

	}

	RED.nodes.registerType("SumUltimate", SumUltimate);
}