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

***Filter output result***
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

<b>If input states are undefined</b><br />
	Every time you create a node or modify the node, all inputs are set to undefined. This means that the node will wait the arrive of all topics (for example 3 topics, if you've selected 3 topics in the option), before it can output a payload. This can be a problem if your logic must be operative as soon as you deploy the flow. To overcome this problem, you can "initialize" all the undefined inputs with True or False.
	<ol>	
		<li>Leave undefined: Standard behaviour, the node will wait all the "undefined" topics to arrive, then starts a flow with the result.</li>
		<li>True or False: The node is immediately operative, by force the initialization of the "undefined" inputs with "true" or "false".</li>
	</ol>
	<br/>


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
