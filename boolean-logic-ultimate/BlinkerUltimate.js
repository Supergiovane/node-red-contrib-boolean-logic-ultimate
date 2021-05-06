module.exports = function (RED) {
	function BlinkerUltimate(config) {
		RED.nodes.createNode(this, config);
		var node = this;
		node.tBlinker = null;// Timer Blinker
		node.blinkfrequency = config.blinkfrequency === undefined ? 500 : Number(config.blinkfrequency);
		node.curPayload = false;
		node.isBlinking = false; // Is the timer running?
		node.stopbehaviorPIN1 = config.stopbehaviorPIN1 === undefined ? "0" : config.stopbehaviorPIN1;
		node.stopbehaviorPIN1 = node.stopbehaviorPIN1 == "0" ? false : true;
		node.stopbehaviorPIN2 = config.stopbehaviorPIN2 === undefined ? 0 : config.stopbehaviorPIN2;
		node.stopbehaviorPIN2 = node.stopbehaviorPIN2 == "0" ? false : true;

		function setNodeStatus({ fill, shape, text }) {
			var dDate = new Date();
			node.status({ fill: fill, shape: shape, text: text + " (" + dDate.getDate() + ", " + dDate.toLocaleTimeString() + ")" })
		}

		// 12/04/2021 Autostart blinker?
		if (config.initializewith !== undefined && config.initializewith === "1") {
			node.tBlinker = setInterval(handleTimer, node.blinkfrequency); //  Start the timer that handles the queue of telegrams
			node.isBlinking = true;
			setNodeStatus({ fill: "green", shape: "dot", text: "-> Autostarted" });
		} else {
			setNodeStatus({ fill: "grey", shape: "ring", text: "|| Off" });
		}

		node.on('input', function (msg) {

			if (msg.hasOwnProperty("interval")) {
				try {
					node.blinkfrequency = msg.interval;
					if (node.isBlinking) // 29/05/2020 If was blinking, restart the timer with the new interval
					{
						if (node.tBlinker !== null) clearInterval(node.tBlinker);
						node.tBlinker = setInterval(handleTimer, node.blinkfrequency); //  Start the timer that handles the queue of telegrams
					}
				} catch (error) {
					node.blinkfrequency = 500;
					setNodeStatus({ fill: "red", shape: "dot", text: "Invalid interval received" });
				}
			}
			if (msg.hasOwnProperty("payload")) {
				// 06/11/2019 
				if (ToBoolean(msg.payload) === true) {
					if (node.tBlinker !== null) clearInterval(node.tBlinker);
					node.tBlinker = setInterval(handleTimer, node.blinkfrequency); //  Start the timer that handles the queue of telegrams
					node.isBlinking = true;
					setNodeStatus({ fill: "green", shape: "dot", text: "-> On" });
				} else {
					if (node.tBlinker !== null) clearInterval(node.tBlinker);
					node.isBlinking = false;
					setNodeStatus({ fill: "red", shape: "dot", text: "|| Off" });
					node.send([{ payload: node.stopbehaviorPIN1 }, { payload: node.stopbehaviorPIN2 }]);
					node.curPayload = node.stopbehaviorPIN1;
				}
			}

		});

		node.on('close', function (removed, done) {
			if (node.tBlinker !== null) clearInterval(node.tBlinker);
			node.isBlinking = false;
			node.send([{ payload: node.stopbehaviorPIN1 }, { payload: node.stopbehaviorPIN2 }]);
			node.curPayload = node.stopbehaviorPIN1;
			done();
		});


		function ToBoolean(value) {
			var res = false;
			var decimal = /^\s*[+-]{0,1}\s*([\d]+(\.[\d]*)*)\s*$/
			
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
			node.send([{ payload: node.curPayload }, { payload: !node.curPayload }]);
		}
	}


	RED.nodes.registerType("BlinkerUltimate", BlinkerUltimate);
}