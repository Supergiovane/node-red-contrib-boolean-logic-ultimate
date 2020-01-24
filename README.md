# node-red-contrib-boolean-logic-ultimate

![Sample Node](img/logo.png) 

[![NPM version][npm-version-image]][npm-url]
[![NPM downloads per month][npm-downloads-month-image]][npm-url]
[![NPM downloads total][npm-downloads-total-image]][npm-url]
[![MIT License][license-image]][license-url]
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Donate via PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg?style=flat-square)](https://www.paypal.me/techtoday) 

A set of Node-RED enhanced boolean logic, with persisten values after reboot and more

<a href="http://eepurl.com/gJm095" target="_blank">Subscribe to my channel.</a> Only news about my nodes, no spam, no ads. I'm a github developer, not a merchant.

> Wellcome! First of all thank you for your interest in my nodes. This is a set of logic nodes, to overcome the simplicity of the default node-red boolean logic nodes.
Hope you enjoy that and if you're in trouble, please ask!

## CHANGELOG
* See <a href="https://github.com/Supergiovane/node-red-contrib-boolean-logic-ultimate/blob/master/CHANGELOG.md">here the changelog</a>

# BOOLEAN LOGIC

<img src='https://raw.githubusercontent.com/Supergiovane/node-red-contrib-boolean-logic-ultimate/master/img/bl1.png' width='60%'>

<details><summary>CLICK HERE, copy and paste it into your flow</summary>
<code>
[{"id":"1a90a718.5c0409","type":"BooleanLogicUltimate","z":"adb2ee5c.0bf6e","name":"","filtertrue":"both","persist":true,"sInitializeWith":"WaitForPayload","triggertopic":"trigger","outputtriggeredby":"all","inputCount":2,"topic":"result","x":380,"y":160,"wires":[["5f9fbfcc.d2c34"],[],[]]},{"id":"81ef6fec.5d413","type":"inject","z":"adb2ee5c.0bf6e","name":"Night","topic":"Dark","payload":"true","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":170,"y":180,"wires":[["1a90a718.5c0409"]]},{"id":"e0d5d620.966478","type":"inject","z":"adb2ee5c.0bf6e","name":"Daylight","topic":"Dark","payload":"false","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":160,"y":140,"wires":[["1a90a718.5c0409"]]},{"id":"1c2f8e73.2c22ba","type":"inject","z":"adb2ee5c.0bf6e","name":"Motion detect true","topic":"Motion","payload":"true","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":130,"y":240,"wires":[["1a90a718.5c0409"]]},{"id":"5f9fbfcc.d2c34","type":"debug","z":"adb2ee5c.0bf6e","name":"Garden Light","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","x":580,"y":160,"wires":[]},{"id":"201baa3d.7c63ae","type":"inject","z":"adb2ee5c.0bf6e","name":"Motion detect false","topic":"Motion","payload":"true","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":130,"y":280,"wires":[["1a90a718.5c0409"]]},{"id":"b65f4ff4.bfe2c8","type":"comment","z":"adb2ee5c.0bf6e","name":"Motion sensor turns on lights, when it's dark. The light turns off itself at day","info":"","x":290,"y":100,"wires":[]}]
</code>
</details>

<img src='https://raw.githubusercontent.com/Supergiovane/node-red-contrib-boolean-logic-ultimate/master/img/bl2.png' width='60%'>

<details><summary>CLICK HERE, copy and paste it into your flow</summary>
<code>
[{"id":"53a10a7a.cf1894","type":"BooleanLogicUltimate","z":"a76c6a12.37379","name":"","filtertrue":"onlytrue","persist":true,"sInitializeWith":"true","triggertopic":"Pushbutton","outputtriggeredby":"onlyonetopic","inputCount":2,"topic":"result","x":340,"y":220,"wires":[["cd9244ea.471b78"],[],[]]},{"id":"9318320b.670af8","type":"inject","z":"a76c6a12.37379","name":"","topic":"Pushbutton","payload":"true","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":120,"y":220,"wires":[["53a10a7a.cf1894"]]},{"id":"20a981b9.552b4e","type":"inject","z":"a76c6a12.37379","name":"","topic":"IsNight","payload":"true","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":110,"y":320,"wires":[["53a10a7a.cf1894"]]},{"id":"da0dff55.d7888","type":"inject","z":"a76c6a12.37379","name":"","topic":"IsNight","payload":"false","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":110,"y":360,"wires":[["53a10a7a.cf1894"]]},{"id":"7129d101.1fb7d8","type":"comment","z":"a76c6a12.37379","name":"Pushbutton to switch on light stairs, only if it's night.","info":"","x":210,"y":180,"wires":[]},{"id":"cd9244ea.471b78","type":"debug","z":"a76c6a12.37379","name":"Temporized Stairs Lightbulb","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","x":580,"y":220,"wires":[]},{"id":"ad5a62a1.7ad81","type":"comment","z":"a76c6a12.37379","name":"Brightness sensor","info":"","x":110,"y":280,"wires":[]}]
</code>
</details>

The node performs Boolean logic on the incoming payloads.<br/>
The node expects a fixed number of topics (configured in the settings) on which it will operate. It will only output a value 
when it has seen the expected number of topics. If it ever sees more than the configured number of topics it will log a message then reset its state and start over.<br/>
The input message is preserved and passed to the output pin, changing only the topic and the payload. 

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
- Single topic + eval other inputs: the node evaluates all the input topics, but only whenever it receives a msg input with the **specified topic**, it  outputs a msg to the flow.

**If input states are undefined**

Every time you create a node or modify the node, all inputs are set to undefined. This means that the node will wait the arrive of all topics (for example 3 topics, if you've selected 3 topics in the option), before it can output a payload. This can be a problem if your logic must be operative as soon as you deploy the flow. To overcome this problem, you can "initialize" all the undefined inputs with True or False.
- Leave undefined: Standard behaviour, the node will wait all the "undefined" topics to arrive, then starts a flow with the result.
- True or False: The node is immediately operative, by force the initialization of the "undefined" inputs with "true" or "false".

**Remember latest input values after reboot**

If checked, the input values are retained after a node-red reboot. That means, that if you reboot your node-red, you don't need to wait all inputs to arrive and initialize the node, before the node can output a payload.<br/>
Every time you modify the node's config, <b>the retained values are cleared</b>.<br/>


# INTERRUPT FLOWS ULTIMATE

Whenever this node receives a payload = false from a specific topic, it stops output messages to the flow. As soon it receives payload = true from this topic, the output messages start to flow out again.

<img src='https://raw.githubusercontent.com/Supergiovane/node-red-contrib-boolean-logic-ultimate/master/img/if0.png' width='60%'>

<details><summary>CLICK HERE, copy and paste it into your flow</summary>
<code>
[{"id":"1fd91f1f.c1fae9","type":"InterruptFlowUltimate","z":"a76c6a12.37379","name":"Interrupt Flow","triggertopic":"IsNight","x":360,"y":440,"wires":[["b9844c7f.0f306"]]},{"id":"eaa32462.398808","type":"comment","z":"a76c6a12.37379","name":"Pushbutton to switch on stairs light, only if it's night, using flow interruption","info":"","x":300,"y":400,"wires":[]},{"id":"10787f38.edfe81","type":"inject","z":"a76c6a12.37379","name":"","topic":"IsNight","payload":"true","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":130,"y":540,"wires":[["1fd91f1f.c1fae9"]]},{"id":"a6092a15.1c592","type":"inject","z":"a76c6a12.37379","name":"","topic":"IsNight","payload":"false","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":130,"y":580,"wires":[["1fd91f1f.c1fae9"]]},{"id":"21ba9c30.02abbc","type":"comment","z":"a76c6a12.37379","name":"Brightness sensor","info":"","x":130,"y":500,"wires":[]},{"id":"af131ae5.a1bfb8","type":"inject","z":"a76c6a12.37379","name":"","topic":"Pushbutton","payload":"true","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":120,"y":440,"wires":[["1fd91f1f.c1fae9"]]},{"id":"b9844c7f.0f306","type":"debug","z":"a76c6a12.37379","name":"Temporized Stairs Lightbulb","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","x":600,"y":440,"wires":[]}]
</code>
</details>

# INVERT ULTIMATE

Outputs the inverted input. For example true -> false<br />
The input message is preserved and passed to the output pin, changing only the topic and the payload. If the input message has it's own topic, it'll be preserved as well.

# FILTER ULTIMATE

This node has 2 outputs.<br />
If the input payload is true, the node will send <code>true</code> on output 1 and nothing on oputput 2<br />
If the input payload is false, the node will send nothing on output 1, and <code>false</code> on oputput 2<br />
The input message is preserved and passed to the output pin, changing only the topic and the payload. If the input message has it's own topic, it'll be preserved as well.


[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://github.com/Supergiovane/node-red-contrib-boolean-logic-ultimate/master/LICENSE
[npm-url]: https://npmjs.org/package/node-red-contrib-boolean-logic-ultimate
[npm-version-image]: https://img.shields.io/npm/v/node-red-contrib-boolean-logic-ultimate.svg
[npm-downloads-month-image]: https://img.shields.io/npm/dm/node-red-contrib-boolean-logic-ultimate.svg
[npm-downloads-total-image]: https://img.shields.io/npm/dt/node-red-contrib-boolean-logic-ultimate.svg
