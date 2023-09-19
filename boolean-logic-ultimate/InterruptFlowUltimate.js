module.exports = function (RED) {
  function InterruptFlowUltimate(config) {
    RED.nodes.createNode(this, config);
    this.config = config;
    var node = this;
    node.currentMsg = {}; // Stores current payload
    node.sTriggerTopic =
      node.config.triggertopic.replace(
        /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
        ""
      ) || "trigger"; // Topic controlling the bInviaMessaggio
    node.bInviaMessaggio =
      node.config.initializewith === undefined ||
      node.config.initializewith === "1"
        ? true
        : false; // Send the message or not
    node.autoToggle =
      config.autoToggle === undefined ? 0 : parseInt(config.autoToggle); // Auto toggle the selected "initializewith" after a while (useful for homekit bridged, that sends junk after start)
    node.timerAutoToggle = null;

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
    setNodeStatus({ fill: "green", shape: "ring", text: "-> pass" });

    node.alignStatus = () => {
      let sAutoToggle =
        node.autoToggle > 0 ? " (Autotoggle in " + node.autoToggle + "s)" : "";
      if (node.bInviaMessaggio) {
        setNodeStatus({
          fill: "green",
          shape: "dot",
          text: "-> pass" + sAutoToggle,
        });
      } else {
        setNodeStatus({
          fill: "red",
          shape: "dot",
          text: "|| stop" + sAutoToggle,
        });
      }
    };

    if (node.autoToggle > 0) {
      node.timerAutoToggle = setTimeout(() => {
        node.autoToggle = 0;
        node.bInviaMessaggio = !node.bInviaMessaggio;
        node.alignStatus();
      }, node.autoToggle * 1000);
    }

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
          msg.payload = utils.ToBoolean(
            sPayload,
            RED.nodes.getNode(config.translatorConfig) // Retrieve the config node. It can be null, but it's handled in utils.js; // 15/11/2021 Convert input to boolean.
          );
          if (msg.payload === undefined) return null;
          if (node.timerAutoToggle !== null)
            // 28/01/2022 Stop autotoggle
            clearInterval(node.timerAutoToggle);

          if (msg.hasOwnProperty("play")) {
            if (node.currentMsg.payload !== undefined) {
              node.currentMsg.isReplay = true;
              setNodeStatus({
                fill: "yellow",
                shape: "dot",
                text: "-> replay",
              });
              // Restore previous status
              let t = setTimeout(() => {
                if (node.bInviaMessaggio) {
                  setNodeStatus({
                    fill: "green",
                    shape: "dot",
                    text: "-> pass",
                  });
                } else {
                  setNodeStatus({
                    fill: "red",
                    shape: "dot",
                    text: "|| stop (stored last msg)",
                  });
                }
              }, 1000);
              node.send(node.currentMsg);
            } else {
              setNodeStatus({
                fill: "grey",
                shape: "dot",
                text: "Nothing to replay",
              });
            }
            return;
          } else if (msg.hasOwnProperty("reset")) {
            node.currentMsg = {};
            setNodeStatus({
              fill: "yellow",
              shape: "dot",
              text: "Deleted stored msg",
            });
            return;
          } else if (msg.payload === true) {
            node.bInviaMessaggio = true;
            setNodeStatus({ fill: "green", shape: "dot", text: "-> pass" });
            return;
          } else if (msg.payload === false) {
            node.bInviaMessaggio = false;
            setNodeStatus({
              fill: "red",
              shape: "dot",
              text: "|| stop (stored last msg)",
            });
            return;
          }
        }
      }
      node.currentMsg = RED.util.cloneMessage(msg);
      if (node.bInviaMessaggio) {
        node.send(msg);
      }
    });
  }

  RED.nodes.registerType("InterruptFlowUltimate", InterruptFlowUltimate);
};
