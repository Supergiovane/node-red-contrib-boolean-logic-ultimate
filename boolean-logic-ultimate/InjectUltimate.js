

module.exports = function (RED) {
	function InjectUltimate(config) {
		RED.nodes.createNode(this, config);
		this.config = config;
		var node = this;
		node.curVal = true;
		node.topic = config.topic || "Inject";
		node.outputJSON = (config.outputJSON === undefined || config.outputJSON === '') ? '{ \n\t"payload":"hello",\n\t"topic":"1"\n}' : config.outputJSON;
		setNodeStatus({ fill: "grey", shape: "dot", text: "Waiting" });


		RED.httpAdmin.post("/InjectUltimate/:id", RED.auth.needsPermission("InjectUltimate.write"), function (req, res) {
			var node = RED.nodes.getNode(req.params.id);
			if (node != null) {
				try {
					node.buttonpressed();
					res.sendStatus(200);
				} catch (err) {
					res.sendStatus(500);
					node.error(RED._("InjectUltimate.failed, error:" + err.message));
				}
			} else {
				res.sendStatus(404);
			}
		});

		// 29/08/2020 triggered by button press
		node.buttonpressed = () => {
			setNodeStatus({ fill: "green", shape: "dot", text: "Pin1:true, Pin2:false, Pin3:" + node.curVal.toString() + " (next " + (!node.curVal).toString() + ")" });
			let msgTrue = { payload: true, topic: node.topic };
			let msgFalse = { payload: false, topic: node.topic };
			let msgToggled = { payload: node.curVal, topic: node.topic };
			node.curVal = !node.curVal;
			let jRet;
			try {
				jRet = JSON.parse(node.outputJSON);
				if (node.outputJSON.topic === undefined) node.outputJSON.topic = node.topic; // Add topic if not present
			} catch (error) {
				setNodeStatus({ fill: "red", shape: "dot", text: "JSON error " + error.trace });
				RED.log.error("injectUltimate: node.outputJSON = JSON.parse(node.outputJSON) error:" + error.trace);
			}
			node.send([msgTrue, msgFalse, msgToggled, jRet]);
		}

		function setNodeStatus({ fill, shape, text }) {
			let dDate = new Date();
			node.status({ fill: fill, shape: shape, text: text + " (" + dDate.getDate() + ", " + dDate.toLocaleTimeString() + ")" })
		}

	}



	RED.nodes.registerType("InjectUltimate", InjectUltimate);
}