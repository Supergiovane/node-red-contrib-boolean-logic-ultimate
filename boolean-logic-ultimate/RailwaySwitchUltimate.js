module.exports = function (RED) {
  function RailwaySwitchUltimate(config) {
    RED.nodes.createNode(this, config);
    this.config = config;
    var node = this;
    node.currentMsg = {}; // Stores current payload
    node.sTriggerTopic =
      node.config.triggertopic.replace(
        /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
        ""
      ) || "trigger"; // Topic controlling the sRailway
    node.sRailway = String(node.config.initializewith); // Railway selector

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
        text: "-> PIN " + node.sRailway,
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
              text: "Received invalid payload from " + msg.topic || "",
            });
            return;
          }
          sPayload = String(sPayload); // Must be always a string
          msg.payload = utils.ToAny(
            sPayload,
            RED.nodes.getNode(config.translatorConfig) // Retrieve the config node. It can be null, but it's handled in utils.js;
          );
          if (msg.payload === undefined) return null;

          // Backward compatibility
          // Pass msg.payload = false switches the msg input to the UPPER output
          // Pass msg.payload = true switches the msg input to the LOWER output
          if (msg.payload === false) msg.payload = '0';
          if (msg.payload === true) msg.payload = '1';
          node.sRailway = msg.payload;
          node.alignStatus();
          return; // DONT'S SEND THIS MESSAGE
        }
      }
      node.currentMsg = RED.util.cloneMessage(msg);
      if (node.sRailway === "0") node.send([msg, null, null, null, null]);
      if (node.sRailway === "1") node.send([null, msg, null, null, null]);
      if (node.sRailway === "2") node.send([null, null, msg, null, null]);
      if (node.sRailway === "3") node.send([null, null, null, msg, null]);
      if (node.sRailway === "4") node.send([null, null, null, null, msg]);
    });
  }

  RED.nodes.registerType("RailwaySwitchUltimate", RailwaySwitchUltimate);
};
