module.exports = function (RED) {
  function Comparator(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.config = config;
    node.math = config.math === undefined ? "===" : config.math;
    node.topic1Value = undefined;
    node.topic2Value = undefined;
    
    function setNodeStatus({ fill, shape, text }) {
      let dDate = new Date();
      node.status({
        fill: fill,
        shape: shape,
        text:
          text +
          " (" +
          dDate.getDate() +
          ", " +
          dDate.toLocaleTimeString() +
          ")",
      });
    }

    setNodeStatus({ fill: "grey", shape: "dot", text: "" });

    function fetchFromObject(obj, prop) {
      if (obj === undefined) {
        return undefined;
      }

      var _index = prop.indexOf(".");
      if (_index > -1) {
        return fetchFromObject(
          obj[prop.substring(0, _index)],
          prop.substr(_index + 1)
        );
      }

      return obj[prop];
    }

    node.on("input", function (msg) {
      if (!msg.hasOwnProperty("topic")) {
        setNodeStatus({
          fill: "red",
          shape: "ring",
          text: "Incoming msg without topic! Please set the topic.",
        });
        return;
      }

      try {
        let props = ([] = node.config.property.split("."));
        let ret = fetchFromObject(msg, node.config.property);
        if (ret !== undefined) {
          ret = Number(ret);

          // Sum
          if (!isNaN(ret) && isFinite(ret)) {
            if (msg.topic === node.config.topic1) node.topic1Value = ret;
            if (msg.topic === node.config.topic2) node.topic2Value = ret;

            if (
              node.topic1Value === undefined ||
              node.topic2Value === undefined
            ) {
              setNodeStatus({
                fill: "blue",
                shape: "ring",
                text: "Waiting for valid topics.",
              });
              return;
            }

            if (eval(node.topic1Value + node.math + node.topic2Value)) {
              //msg.inputmsg = RED.util.cloneMessage(msg);
              msg.topic = node.config.name;
              msg.payload = true;
            } else {
              msg.payload = false;
            }
            msg.topic = node.config.name;
            node.send(msg);
            setNodeStatus({
              fill: "green",
              shape: "dot",
              text: "Done " + msg.payload,
            });
          }
        }
      } catch (error) {
        setNodeStatus({ fill: "red", shape: "ring", text: error.message });
      }
    });
  }

  RED.nodes.registerType("Comparator", Comparator);
};
