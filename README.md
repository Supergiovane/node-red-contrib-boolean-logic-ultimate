# node-red-contrib-boolean-logic-ultimate

Set of enhanced logic nodes for your flows.

[![NPM version][npm-version-image]][npm-url]
[![NPM downloads per month][npm-downloads-month-image]][npm-url]
[![NPM downloads total][npm-downloads-total-image]][npm-url]
[![MIT License][license-image]][license-url]
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Donate via PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg?style=flat-square)](https://www.paypal.me/techtoday) 

[![Donate via PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg?style=flat-square)](https://www.paypal.me/techtoday) 

<a href="http://eepurl.com/gJm095" target="_blank">Subscribe to my channel.</a> Only news about my nodes, no spam, no ads. I'm a github developer, not a merchant.

> Wellcome! First of all thank you for your interest in my nodes. This is a set of logic nodes, to overcome the simplicity of the default node-red boolean logic nodes.
Hope you enjoy that and if you're in trouble, please ask!

## CHANGELOG
* See <a href="https://github.com/Supergiovane/node-red-contrib-boolean-logic-ultimate/blob/master/CHANGELOG.md">here the changelog</a>

# BOOLEAN LOGIC
The node performs Boolean logic on the incoming payloads.<br/>
The node expects a fixed number of topics (configured in the settings) on which it will operate. It will only output a value 
when it has seen the expected number of topics. If it ever sees more than the configured number of topics it will log a message then reset its state and start over.<br/>

The node performs 3 checks (<b>AND,OR,XOR</b>) on the incoming boolean payloads and outputs the result at the same time, as follow:<br/>
- Output "AND": true or false<br/>
- Output "OR": true or false<br/>
- Output "XOR": true or false<br/>

The node can have a persistent input: the input values are retained after a node-red reboot. That means, that if you reboot your node-red, you don't need to wait all inputs to arrive and initialize the node, before the node can output a payload.<br/>
You can also set the default values of the topic inputs.


## CONFIGURATION


**Number of different topics to evaluate**

Set the number of different topics to be evaluated. The node will output a message to the flow, after this number of different topics arrives.<br/>
*Remember: each input topic must be different. For example, if you set this field to 3, the node expects 3 different topics.*


**Filter output result**

- Output both 'true' and 'false' results: Standard behaviour, the node will output <b>true</b> and <b>false</b> whenever it receives an input and calculate the boolean logics as output.
- Output only 'true' results: whenever the node receives an input, it outputs a payload <b>true</b> only if the result of the logic is true. <b>False</b> results are filtered out.

**Trigger mode**

- All topics: standard behaviour, the node will evaluate each input topic and ouputs the values. At each input change, it will output a msg on the flow.
- Single topic + eval other inputs: the node evaluates all the input topics, but only whenever it receives a msg input with the **specified topic** (having payload **true**), it  outputs a msg to the flow.

**If input states are undefined**

Every time you create a node or modify the node, all inputs are set to undefined. This means that the node will wait the arrive of all topics (for example 3 topics, if you've selected 3 topics in the option), before it can output a payload. This can be a problem if your logic must be operative as soon as you deploy the flow. To overcome this problem, you can "initialize" all the undefined inputs with True or False.
- Leave undefined: Standard behaviour, the node will wait all the "undefined" topics to arrive, then starts a flow with the result.
- True or False: The node is immediately operative, by force the initialization of the "undefined" inputs with "true" or "false".

**Remember latest input values after reboot**

If checked, the input values are retained after a node-red reboot. That means, that if you reboot your node-red, you don't need to wait all inputs to arrive and initialize the node, before the node can output a payload.<br/>
Every time you modify the node's config, <b>the retained values are cleared</b>.<br/>


# INTERRUPT FLOWS

Whenever this node receives a payload = false from a specific topic, it stops output messages to the flow. As soon it receives payload = true from this topic, the output messages start to flow out again.

# INVERT ULTIMATE

Outputs the inverted input. For example true -> false

# FILTER ULTIMATE

This node has 2 outputs.<br />
If the input payload is true, the node will send <code>true</code> on output 1 and nothing on oputput 2<br />
If the input payload is false, the node will send nothing on output 1, and <code>false</code> on oputput 2<br />


[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://github.com/Supergiovane/node-red-contrib-boolean-logic-ultimate/master/LICENSE
[npm-url]: https://npmjs.org/package/node-red-contrib-boolean-logic-ultimate
[npm-version-image]: https://img.shields.io/npm/v/node-red-contrib-boolean-logic-ultimate.svg
[npm-downloads-month-image]: https://img.shields.io/npm/dm/node-red-contrib-boolean-logic-ultimate.svg
[npm-downloads-total-image]: https://img.shields.io/npm/dt/node-red-contrib-boolean-logic-ultimate.svg
