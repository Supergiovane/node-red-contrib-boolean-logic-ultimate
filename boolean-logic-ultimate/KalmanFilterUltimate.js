module.exports = function (RED) {
  function KalmanFilterUltimate(config) {
    RED.nodes.createNode(this, config);
    this.config = config;
    var node = this;
    const KalmanFilter = require('kalmanjs');
    var kalmanFilter = undefined;

    function initFilter() {
      try {
        kalmanFilter = new KalmanFilter({ R: config.R || 0.01, Q: config.Q || 3 });
      } catch (error) {
      }
    }
    initFilter();

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

    setNodeStatus({ fill: "grey", shape: "dot", text: "Waiting" });

    this.on("input", function (msg) {
      // 11/11/2021 Clone input message and replace only relevant topics
      const utils = require("./utils.js");
      let sPayload = utils.fetchFromObject(
        msg,
        config.payloadPropName || "payload"
      );

      if (msg.reset !== undefined) {
        initFilter();
        setNodeStatus({
          fill: "grey",
          shape: "dot",
          text: "Filter initialized"
        });
        return;
      }

      // 15/11/2021 inform user about undefined topic or payload
      if (sPayload === undefined) {
        setNodeStatus({
          fill: "red",
          shape: "dot",
          text: "Received invalid payload from " + msg.topic || "",
        });
        return;
      }

      try {
        if (sPayload instanceof Array) {
          msg.payload = sPayload.map(function (v) {
            return kalmanFilter.filter(v);
          });
        } else {
          msg.payload = kalmanFilter.filter(sPayload);
        }
        msg.payload = Math.round((msg.payload + Number.EPSILON) * 1000) / 1000
        setNodeStatus({
          fill: "green",
          shape: "dot",
          text: msg.payload,
        });
      } catch (error) {
      }

      node.send(msg);

    });
  }

  RED.nodes.registerType("KalmanFilterUltimate", KalmanFilterUltimate);
};
