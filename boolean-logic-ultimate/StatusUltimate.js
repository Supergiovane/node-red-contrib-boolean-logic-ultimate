module.exports = function (RED) {
	function StatusUltimate(config) {
		RED.nodes.createNode(this, config);
		this.config = config;
		var node = this;

		function setNodeStatus({ fill, shape, text }) {
			var dDate = new Date();
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
			try {
				let props = [] = this.config.property.split(".");
				let ret = fetchFromObject(msg, this.config.property);
				if (ret !== undefined) {
					setNodeStatus({ fill: "green", shape: "ring", text: ret.toString() });
				} else {
					setNodeStatus({ fill: "red", shape: "ring", text: this.config.property + " is undefined."});
				}
			} catch (error) {
				//console.log(error.message);
			}
			node.send(msg);
		});





	}

	RED.nodes.registerType("StatusUltimate", StatusUltimate);
}