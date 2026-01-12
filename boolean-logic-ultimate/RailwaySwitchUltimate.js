module.exports = function (RED) {
  function RailwaySwitchUltimate(config) {
    RED.nodes.createNode(this, config);
    this.config = config;
    var node = this;
    node.currentMsg = {}; // Stores current payload

    const outputCountRaw =
      config.outputs !== undefined ? parseInt(config.outputs, 10) : parseInt(config.outputCount, 10);
    node.outputCount = Number.isFinite(outputCountRaw)
      ? Math.max(1, Math.min(10, outputCountRaw))
      : 5;

    node.sTriggerTopic =
      node.config.triggertopic.replace(
        /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
        ""
      ) || "trigger"; // Topic controlling the sRailway

    function parsePinIndex(value) {
      if (value === false) return 0;
      if (value === true) return 1;
      const parsed = parseInt(String(value), 10);
      return Number.isFinite(parsed) ? parsed : null;
    }

    const initialPin = parsePinIndex(node.config.initializewith);
    node.railIndex =
      initialPin === null
        ? 0
        : Math.max(0, Math.min(node.outputCount - 1, initialPin)); // Railway selector

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

    node.alignStatus = () => {
      setNodeStatus({
        fill: "green",
        shape: "dot",
        text: "-> PIN " + node.railIndex,
      });

    };

    node.alignStatus();

    this.on("input", function (msg) {

      var sIncomingTopic = "";
      if (msg.hasOwnProperty("topic")) {

        // 06/11/2019
        if (!msg.hasOwnProperty("topic") || msg.topic === undefined)
          msg.topic = "NoTopicReceived";
        sIncomingTopic = msg.topic.replace(
          /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
          ""
        ); // Cut unwanted Characters
        if (sIncomingTopic === node.sTriggerTopic) {
          // Backward compatibility
          // Pass msg.payload = false switches the msg input to the UPPER output
          // Pass msg.payload = true switches the msg input to the LOWER output
          if (msg.payload === false) msg.payload = '0';
          if (msg.payload === true) msg.payload = '1';

          const utils = require("./utils.js");
          let sPayload = utils.fetchFromObject(
            msg,
            config.payloadPropName || "payload"
          );

          // 15/11/2021 inform user about undefined topic or payload
          if (sPayload === undefined) {
            setNodeStatus({
              fill: "red",
              shape: "dot",
              text: "Received invalid payload from " + (msg.topic || ""),
            });
            return;
          }
          sPayload = String(sPayload); // Must be always a string
          msg.payload = utils.ToAny(
            sPayload,
            RED.nodes.getNode(config.translatorConfig) // Retrieve the config node. It can be null, but it's handled in utils.js;
          );
          if (msg.payload === undefined) return null;

          const nextPin = parsePinIndex(msg.payload);
          if (nextPin === null || nextPin < 0 || nextPin >= node.outputCount) {
            setNodeStatus({
              fill: "red",
              shape: "dot",
              text:
                "Invalid PIN " +
                String(msg.payload) +
                " (valid 0.." +
                String(node.outputCount - 1) +
                ")",
            });
            return;
          }

          node.railIndex = nextPin;
          node.alignStatus();
          return; // DONT'S SEND THIS MESSAGE
        }
      }
      node.currentMsg = RED.util.cloneMessage(msg);

      const out = new Array(node.outputCount).fill(null);
      out[node.railIndex] = msg;
      node.send(out);
    });
  }

  RED.nodes.registerType("RailwaySwitchUltimate", RailwaySwitchUltimate);
};
