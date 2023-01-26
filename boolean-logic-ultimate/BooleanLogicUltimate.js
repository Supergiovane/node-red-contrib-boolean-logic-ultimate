module.exports = function (RED) {
	function BooleanLogicUltimate(config) {
		RED.nodes.createNode(this, config);
		var node = this;
		var fs = require("fs");
		var path = require("path");

		node.config = config;
		node.jSonStates = {}; // JSON object containing the states. 
		node.sInitializeWith = typeof node.config.sInitializeWith === "undefined" ? "WaitForPayload" : node.config.sInitializeWith;
		node.persistPath = path.join(RED.settings.userDir, "booleanlogicultimatepersist"); // 26/10/2020 Contains the path for the states dir.
		node.restrictinputevaluation = config.restrictinputevaluation === undefined ? false : config.restrictinputevaluation;
		node.delayEvaluation = config.delayEvaluation === undefined ? 0 : config.delayEvaluation; // 26/01/2022 Starts evaluating the inputs only after this amount of time is elapsed, after the last msg input or trigger
		if (isNaN(parseInt(node.delayEvaluation)) || parseInt(node.delayEvaluation) < 0) node.delayEvaluation = 0;
		if (typeof node.delayEvaluation === "string") node.delayEvaluation = parseInt(node.delayEvaluation);
		node.timerDelayEvaluation = null;
		node.inputMessage = {}; // 26/01/2022 input message is stored here.

		function setNodeStatus({ fill, shape, text }) {
			let dDate = new Date();
			node.status({ fill: fill, shape: shape, text: text + " (" + dDate.getDate() + ", " + dDate.toLocaleTimeString() + ")" })
		}

		// Helper for the config html, to be able to delete the peristent states file
		RED.httpAdmin.get("/stateoperation_delete", RED.auth.needsPermission('BooleanLogicUltimate.read'), function (req, res) {
			//node.send({ req: req });
			// Detele the persist file
			//var _node = RED.nodes.getNode(req.query.nodeid); // Gets node object from nodeit, because when called from the config html, the node object is not defined
			var _nodeid = req.query.nodeid;
			try {
				if (fs.existsSync(path.join(node.persistPath, _nodeid.toString()))) fs.unlinkSync(path.join(node.persistPath, _nodeid.toString()));
			} catch (error) {
			}
			res.json({ status: 220 });
		});

		// 26/10/2020 Check for path and create it if doens't exists
		if (!fs.existsSync(node.persistPath)) {
			// Create the path
			try {
				fs.mkdirSync(node.persistPath);
				// Backward compatibility: Copy old states dir into the new folder
				if (fs.existsSync("states")) {
					var filenames = fs.readdirSync("states");
					filenames.forEach(file => {
						RED.log.info("BooleanLogicUltimate: migrating from old states path to the new persist " + file);
						fs.copyFileSync("states/" + file, path.join(node.persistPath, path.basename(file)));
					});
				}
			} catch (error) {
				RED.log.error("BooleanLogicUltimate: error creating persistent folder. Check user permission to write to the filesystem " + error.message);
			}
		}

		// Populate the state array with the persisten file
		if (node.config.persist == true) {
			try {
				var contents = fs.readFileSync(path.join(node.persistPath, node.id.toString())).toString();
				if (typeof contents !== 'undefined') {
					node.jSonStates = JSON.parse(contents);
					setNodeStatus({ fill: "blue", shape: "ring", text: "Loaded persistent states (" + Object.keys(node.jSonStates).length + " total)." });
				}
			} catch (error) {
				setNodeStatus({ fill: "grey", shape: "ring", text: "No persistent states" });
			}

		} else {
			setNodeStatus({ fill: "yellow", shape: "dot", text: "Waiting for input states" });
		}

		// Starts the evaluation delay timer, if needed
		node.startTimerDelayEvaluation = () => {
			if (node.timerDelayEvaluation !== null) clearTimeout(node.timerDelayEvaluation);
			node.timerDelayEvaluation = setTimeout(() => {
				outputResult();
			}, node.delayEvaluation);
		}

		// 14/08/2019 If some inputs are to be initialized, create a dummy items in the array
		initUndefinedInputs();


		this.on('input', function (msg) {

			// 21/04/2021 Msg to reset all inputs
			if (msg.hasOwnProperty("reset")) {
				setNodeStatus({ fill: "blue", shape: "ring", text: "All inputs have been reset." });
				node.jSonStates = [];
				return;
			}

			// 26/01/2023 you can change the input count from msg
			if (msg.hasOwnProperty("inputcount")) {
				setTimeout(() => {
					setNodeStatus({ fill: "grey", shape: "dot", text: "Input count changed to " + msg.inputcount });
				}, 500);
				try {
					node.config.inputCount = Number(msg.inputcount);	
				} catch (error) {					
				}	
				
			}

			// 15/11/2021 inform user about undefined topic or payload
			if (!msg.hasOwnProperty("topic") || msg.topic === undefined || msg.topic === null) {
				setNodeStatus({ fill: "red", shape: "dot", text: "Received invalid topic!" });
				return;
			}

			var topic = msg.topic;
			const utils = require("./utils.js");
			let sPayload = utils.fetchFromObject(msg, config.payloadPropName || "payload");

			// 12/08/2021 Restrict only to true/false 
			if (node.restrictinputevaluation) {
				if (sPayload !== true && sPayload !== false) {
					setNodeStatus({ fill: "red", shape: "dot", text: "Received non boolean value from " + msg.topic });
					return;
				}
			}

			var value = utils.ToBoolean(sPayload);

			// 15/11/2021 inform user about undefined topic or payload
			if (sPayload === undefined) {
				setNodeStatus({ fill: "red", shape: "dot", text: "Received invalid payload from " + msg.topic || "" });
				return;
			}

			// 14/08/2019 if inputs are initialized, remove a "dummy" item from the state's array, as soon as new topic arrives
			if (node.sInitializeWith !== "WaitForPayload") {
				// Search if the current topic is in the state array
				if (typeof node.jSonStates[topic] === "undefined") {
					// Delete one dummy 
					for (let index = 0; index < node.config.inputCount; index++) {
						if (node.jSonStates.hasOwnProperty("dummy" + index)) {
							//RED.log.info(JSON.stringify(node.jSonStates))
							delete node.jSonStates["dummy" + index];
							//RED.log.info(JSON.stringify(node.jSonStates))
							break;
						}
					}
				}
			}

			// Add current attribute
			node.jSonStates[topic] = value;

			// Save the state array to a perisistent file
			if (node.config.persist == true) {
				try {
					fs.writeFileSync(path.join(node.persistPath, node.id.toString()), JSON.stringify(node.jSonStates));
				} catch (error) {
					setNodeStatus({ fill: "red", shape: "dot", text: "Node cannot write to filesystem: " + error.message });
					RED.log.error("BooleanLogicUltimate: unable to write to the filesystem. Check wether the user running node-red, has write permission to the filesysten. " + error.message);
				}
			}
			node.inputMessage = msg; // 26/01/2022 Store MSG to be used in the outputResult function.

			// Do we have as many inputs as we expect?
			var keyCount = Object.keys(node.jSonStates).length;
			if (keyCount == node.config.inputCount) {

				// var resAND = CalculateResult("AND");
				// var resOR = CalculateResult("OR");
				// var resXOR = CalculateResult("XOR");

				// if (node.config.filtertrue == "onlytrue") {
				// 	if (!resAND) { resAND = null };
				// 	if (!resOR) { resOR = null };
				// 	if (!resXOR) { resXOR = null };
				// }

				// Operation mode evaluation
				if (node.config.outputtriggeredby == "onlyonetopic") {
					if (typeof node.config.triggertopic !== "undefined"
						&& node.config.triggertopic !== ""
						&& msg.hasOwnProperty("topic") && msg.topic !== ""
						&& node.config.triggertopic === msg.topic) {
						if (node.delayEvaluation > 0) {
							node.startTimerDelayEvaluation();
							setNodeStatus({ fill: "blue", shape: "ring", text: "Delay Eval " + node.delayEvaluation + "ms" });
						} else {
							outputResult();
						}
					} else {
						setNodeStatus({ fill: "grey", shape: "ring", text: "Saved (" + (msg.hasOwnProperty("topic") ? msg.topic : "empty input topic") + ") " + value });
					}
				} else {
					if (node.delayEvaluation > 0) {
						node.startTimerDelayEvaluation();
						setNodeStatus({ fill: "blue", shape: "ring", text: "Delay Eval " + node.delayEvaluation + "ms" });
					} else {
						outputResult();
					}
				}
			}
			else if (keyCount > node.config.inputCount) {
				setNodeStatus({ fill: "gray", shape: "ring", text: "Reset due to unexpected new topic" });
				DeletePersistFile();
			} else {
				setNodeStatus({ fill: "green", shape: "ring", text: "Arrived topic " + keyCount + " of " + node.config.inputCount });
			}

		});

		this.on('close', function (removed, done) {
			if (removed) {
				// This node has been deleted
				// Delete persistent states on change/deploy
				DeletePersistFile();
			} else {
				// This node is being restarted
			}
			done();
		});

		function DeletePersistFile() {
			// Detele the persist file
			try {
				if (fs.existsSync(path.join(node.persistPath, node.id.toString()))) fs.unlinkSync(path.join(node.persistPath, node.id.toString()));
				setNodeStatus({ fill: "red", shape: "ring", text: "Persistent states deleted (" + node.id.toString() + ")." });
			} catch (error) {
				setNodeStatus({ fill: "red", shape: "ring", text: "Error deleting persistent file: " + error.toString() });
			}
			node.jSonStates = {}; // Resets inputs
			// 14/08/2019 If the inputs are to be initialized, create a dummy items in the array
			initUndefinedInputs();
		}

		function initUndefinedInputs() {
			if (node.sInitializeWith !== "WaitForPayload") {
				var nTotalDummyToCreate = Number(node.config.inputCount) - Object.keys(node.jSonStates).length;
				if (nTotalDummyToCreate > 0) {
					RED.log.info("BooleanLogicUltimate: Will create " + nTotalDummyToCreate + " dummy (" + node.sInitializeWith + ") values")
					for (let index = 0; index < nTotalDummyToCreate; index++) {
						node.jSonStates["dummy" + index] = node.sInitializeWith === "false" ? false : true;
					}
					let t = setTimeout(() => { setNodeStatus({ fill: "green", shape: "ring", text: "Initialized " + nTotalDummyToCreate + " undefined inputs with " + node.sInitializeWith }); }, 4000)
				}
			}
		}



		function CalculateResult(_operation) {
			var res;

			if (_operation == "XOR") {
				res = PerformXOR();
			}
			else {
				// We need a starting value to perform AND and OR operations.				
				var keys = Object.keys(node.jSonStates);
				res = node.jSonStates[keys[0]];

				for (var i = 1; i < keys.length; ++i) {
					var key = keys[i];
					res = PerformSimpleOperation(_operation, res, node.jSonStates[key]);
				}
			}

			return res;
		}

		function PerformXOR() {
			// XOR = exclusively one input is true. As such, we just count the number of true values and compare to 1.
			var trueCount = 0;

			for (var key in node.jSonStates) {
				if (node.jSonStates[key]) {
					trueCount++;
				}
			}

			return trueCount == 1;
		}

		function PerformSimpleOperation(operation, val1, val2) {
			var res;

			if (operation === "AND") {
				res = val1 && val2;
			}
			else if (operation === "OR") {
				res = val1 || val2;
			}
			else {
				node.error("Unknown operation: " + operation);
			}

			return res;
		}



		function outputResult() {
			let optionalTopic = node.config.topic;
			let calculatedValueAND = CalculateResult("AND");
			let calculatedValueOR = CalculateResult("OR");
			let calculatedValueXOR = CalculateResult("XOR");

			if (node.config.filtertrue == "onlytrue") {
				if (!calculatedValueAND) { calculatedValueAND = null };
				if (!calculatedValueOR) { calculatedValueOR = null };
				if (!calculatedValueXOR) { calculatedValueXOR = null };
			}

			setNodeStatus({ fill: "green", shape: "dot", text: "(AND)" + (calculatedValueAND !== null ? calculatedValueAND : "---") + " (OR)" + (calculatedValueOR !== null ? calculatedValueOR : "---") + " (XOR)" + (calculatedValueXOR !== null ? calculatedValueXOR : "---") });

			var msgAND = null;
			if (calculatedValueAND != null) {
				msgAND = RED.util.cloneMessage(node.inputMessage);
				msgAND.topic = optionalTopic === undefined ? "result" : optionalTopic;
				msgAND.operation = "AND";
				msgAND.payload = calculatedValueAND;

			}
			var msgOR = null;
			if (calculatedValueOR != null) {
				msgOR = RED.util.cloneMessage(node.inputMessage);
				msgOR.topic = optionalTopic === undefined ? "result" : optionalTopic;
				msgOR.operation = "OR";
				msgOR.payload = calculatedValueOR;
			}
			var msgXOR = null;
			if (calculatedValueXOR != null) {
				msgXOR = RED.util.cloneMessage(node.inputMessage);
				msgXOR.topic = optionalTopic === undefined ? "result" : optionalTopic;
				msgXOR.operation = "XOR";
				msgXOR.payload = calculatedValueXOR;
			}
			node.send([msgAND, msgOR, msgXOR]);

		};
	}

	RED.nodes.registerType("BooleanLogicUltimate", BooleanLogicUltimate);
}