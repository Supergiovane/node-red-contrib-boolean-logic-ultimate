module.exports = function(RED) {
    function TranslatorConfig(n) {
        RED.nodes.createNode(this,n);
        this.commandText = n.commandText;

    }
    RED.nodes.registerType("translator-config",TranslatorConfig);
}