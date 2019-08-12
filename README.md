# node-red-contrib-boolean-logic-ultimate

[![NPM version][npm-version-image]][npm-url]
[![NPM downloads per month][npm-downloads-month-image]][npm-url]
[![NPM downloads total][npm-downloads-total-image]][npm-url]
[![MIT License][license-image]][license-url]
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Donate via PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg?style=flat-square)](https://www.paypal.me/techtoday) 

## DESCRIPTION
The node performs Boolean logic on the incoming payloads.<br/>
The node performs 3 checks (<b>AND,OR,XOR</b>) on the incoming boolean payloads and outputs the result at the same time, as follow:<br/>
- Output "AND": true or false<br/>
- Output "OR": true or false<br/>
- Output "XOR": true or false<br/>

The node can have a persistent input: the input values are retained after a node-red reboot. That means, that if you reboot your node-red, you don't need to wait all inputs to arrive and initialize the node, before the node can output a payload.

## ADDITIONAL FUNCTIONS
* Filter ouput results (outputs only true or trye/false)
* Trigger mode selection (Can output a payload only by single input's topic trigger and after evaluation ot other inputs, or can oputput a payload by change of every input)

## CHANGELOG
* See <a href="https://github.com/Supergiovane/node-red-contrib-boolean-logic-ultimate/blob/master/CHANGELOG.md">here the changelog</a>

## CONFIGURATION
<p>
The node expects a fixed number of topics (configured in the settings) on which it will operate. It will only output a value 
when it has seen the expected number of topics. If it ever sees more than the configured number of topics it will log a message then reset its state and start over.<br/>
Changing the topic is usually only needed when chaining multiple boolean nodes after each other becuse the topics will then all be the same when delivered to the nodes further down the chain.<br/>
<br/>
<b>Filter output result</b><br />
<ol>	
    <li>Output both 'true' and 'false' results: Standard behaviour, the node will output <b>true</b> and <b>false</b> whenever it receives an input and calculate the boolean logics as output.</li>
    <li>Output only 'true' results: whenever the node receives an input, it outputs a payload <b>true</b> only if the result of the logic is true. <b>False</b> results are filtered out.</li>
</ol>
<br/>

<b>Trigger mode</b><br />
	The node can acts ad a standard boolean logic or as single topic triggered boolean logic.<br/>
	As single topic triggered boolean logic, the node will evaluate the inputs (and thus will output a payload) only if a specified topic input arrives.<br/>
	In a coding perspectives, it acts as follows:<br/>
	<code>
		if (msg.topic == specified topic)<br/>
		{<br/>
			If (all other inputs are true) -> outputs true otherwise false<br/>
		}<br/>
	</code>
	<ol>	
		<li>All topics: standard behaviour, the node will output <b>true</b> and <b>false</b> by evaluating all inputs. Each input change will trigger the node output.</li>
		<li>Single topic + eval other inputs: <u>only whenever the node receives a msg input with the <b>specified topic</b> (having payload = true)</u>, it starts the evaluation of all other inputs as well and outputs the evaluated payload. If the node receives a msg input other than the <b>specified topic</b>), it only retains it's value for the boolean evaluation.</li>
	</ol>

Example of trigger mode = Single topic + eval other inputs
```js
[{"id":"4d2e4d1.4a02034","type":"BooleanLogicUltimate","z":"5635003e.2d70f","name":"","filtertrue":"both","persist":true,"triggertopic":"MotionSensor","outputtriggeredby":"onlyonetopic","inputCount":"3","topic":"result","x":460,"y":580,"wires":[["a9e93fa0.99508"],[],[]]},{"id":"b3a4633e.ff06c","type":"inject","z":"5635003e.2d70f","name":"","topic":"MotionSensor","payload":"true","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":110,"y":560,"wires":[["4d2e4d1.4a02034"]]},{"id":"150ff8fd.8110e7","type":"inject","z":"5635003e.2d70f","name":"","topic":"Dusk","payload":"true","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":240,"y":760,"wires":[["4d2e4d1.4a02034"]]},{"id":"6ecd73e1.9ac75c","type":"inject","z":"5635003e.2d70f","name":"","topic":"Rain","payload":"true","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":240,"y":660,"wires":[["4d2e4d1.4a02034"]]},{"id":"350fb477.b0d484","type":"inject","z":"5635003e.2d70f","name":"","topic":"Dusk","payload":"false","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":240,"y":800,"wires":[["4d2e4d1.4a02034"]]},{"id":"1118f46a.b967ac","type":"inject","z":"5635003e.2d70f","name":"","topic":"MotionSensor","payload":"false","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":110,"y":600,"wires":[["4d2e4d1.4a02034"]]},{"id":"4e793dec.646b4c","type":"inject","z":"5635003e.2d70f","name":"","topic":"Rain","payload":"false","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":240,"y":700,"wires":[["4d2e4d1.4a02034"]]},{"id":"a9e93fa0.99508","type":"debug","z":"5635003e.2d70f","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":650,"y":580,"wires":[]},{"id":"8d44deef.e81d","type":"comment","z":"5635003e.2d70f","name":"Switch on the light only when it's raining and it's dusk. The trigger is someone entering in the Motion Sensor's area.","info":"Triggers only if someone enters \nin the motion sensor's area","x":410,"y":520,"wires":[]}]
```

<br/><br/>

<b>Remember latest input values after reboot</b><br />
If checked, the input values are retained after a node-red reboot. That means, that if you reboot your node-red, you don't need to wait all inputs to arrive and initialize the node, before the node can output a payload.<br/>
Every time you modify the node's config, <b>the retained values are cleared</b>.<br/>
<br/>
All incoming msg.payloads are converted into a boolean value according to the following rules (this applies to all boolean logic nodes):
<ol>	
    <li>Boolean values are taken as-is.</li>
    <li>For numbers, 0 evaluates to false, all other numbers evaluates to true.</li>
    <li>Strings are converted to numbers if they match the format of a decimal value, then the same rule as for numbers are applied. If it does not match, it evaluates to false. Also, the string "true" evaluates to true.</li>
</ol>
<br>
The XOR operation operates in a one, and only one mode, i.e. (A ^ B) ^ C ... ^ n
</p>
<p>

## OTHER NODES

<b>Invert Ultimate</b><br />
Outputs the inverted input. For example true -> false
</p>
<p>

<b>Filter Ultimate</b><br />
This node has 2 outputs.<br />
If the input payload is true, the node will send <code>true</code> on output 1 and nothing on oputput 2<br />
If the input payload is false, the node will send nothing on output 1, and <code>false</code> on oputput 2<br />
</p>

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://github.com/Supergiovane/node-red-contrib-boolean-logic-ultimate/master/LICENSE
[npm-url]: https://npmjs.org/package/node-red-contrib-boolean-logic-ultimate
[npm-version-image]: https://img.shields.io/npm/v/node-red-contrib-boolean-logic-ultimate.svg
[npm-downloads-month-image]: https://img.shields.io/npm/dm/node-red-contrib-boolean-logic-ultimate.svg
[npm-downloads-total-image]: https://img.shields.io/npm/dt/node-red-contrib-boolean-logic-ultimate.svg
