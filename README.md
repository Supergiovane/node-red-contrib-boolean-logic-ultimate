# node-red-contrib-boolean-logic-ultimate

![Sample Node](img/logo.png) 

[![NPM version][npm-version-image]][npm-url]
[![NPM downloads per month][npm-downloads-month-image]][npm-url]
[![NPM downloads total][npm-downloads-total-image]][npm-url]
[![MIT License][license-image]][license-url]
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Donate via PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg?style=flat-square)](https://www.paypal.me/techtoday) 
[![Facebook][facebook-image]][facebook-url]

A set of Node-RED enhanced boolean logic, with persisten values after reboot and more.

> Wellcome! First of all thank you for your interest in my nodes. This is a set of logic nodes, to overcome the simplicity of the default node-red boolean logic nodes.
Hope you enjoy that and if you're in trouble, please ask!

<br/>
<br/>

## CHANGELOG
* See <a href="https://github.com/Supergiovane/node-red-contrib-boolean-logic-ultimate/blob/master/CHANGELOG.md">here the changelog</a>

<br/>
<br/>

# BOOLEAN LOGIC

<img src='https://raw.githubusercontent.com/Supergiovane/node-red-contrib-boolean-logic-ultimate/master/img/bl1.png' width='60%'>

<details><summary>CLICK HERE, copy and paste it into your flow</summary>
<code>
[{"id":"1a90a718.5c0409","type":"BooleanLogicUltimate","z":"adb2ee5c.0bf6e","name":"","filtertrue":"both","persist":true,"sInitializeWith":"WaitForPayload","triggertopic":"trigger","outputtriggeredby":"all","inputCount":2,"topic":"result","x":380,"y":160,"wires":[["5f9fbfcc.d2c34"],[],[]]},{"id":"81ef6fec.5d413","type":"inject","z":"adb2ee5c.0bf6e","name":"Night","topic":"Dark","payload":"true","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":170,"y":180,"wires":[["1a90a718.5c0409"]]},{"id":"e0d5d620.966478","type":"inject","z":"adb2ee5c.0bf6e","name":"Daylight","topic":"Dark","payload":"false","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":160,"y":140,"wires":[["1a90a718.5c0409"]]},{"id":"1c2f8e73.2c22ba","type":"inject","z":"adb2ee5c.0bf6e","name":"Motion detect true","topic":"Motion","payload":"true","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":130,"y":240,"wires":[["1a90a718.5c0409"]]},{"id":"5f9fbfcc.d2c34","type":"debug","z":"adb2ee5c.0bf6e","name":"Garden Light","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","x":580,"y":160,"wires":[]},{"id":"201baa3d.7c63ae","type":"inject","z":"adb2ee5c.0bf6e","name":"Motion detect false","topic":"Motion","payload":"false","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":130,"y":280,"wires":[["1a90a718.5c0409"]]},{"id":"b65f4ff4.bfe2c8","type":"comment","z":"adb2ee5c.0bf6e","name":"Motion sensor turns on lights, when it's dark. The light turns off itself at day","info":"","x":290,"y":100,"wires":[]}]
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

The node performs some checks on the incoming boolean payloads and outputs all results at the same time, as follow:<br/>
- Output "AND": true or false<br/>
- Output "OR": true or false<br/>
- Output "XOR": true or false<br/>

If you need ***"NAND"*** or ***"NOR"*** gate, just put an **InvertUltimate** node respectively after the "AND" or "OR" pin.

The node can have a persistent input: the input values are retained after a node-red reboot. That means, that if you reboot your node-red, you don't need to wait all inputs to arrive and initialize the node, before the node can output a payload.<br/>
You can also set the default values of the topic inputs.<br/>
The node can convert arbitrary input values to true/false. It supports Homeassistant ***"on"*** and ***"off"*** as well. For enabling auto conversion, please be sure to disable **Reject non boolean (true/false) input values** <br/>



### CONFIGURATION


**Inputs count**

Set the number of different topics to be evaluated. The node will output a message to the flow, after this number of *different* topics arrives.<br/>
*Remember: each input topic must be different. For example, if you set this field to 3, the node expects 3 different topics.*


**Filter output**

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

**Reject non boolean (true/false) input values**

If checked, the node will accept only boolean true/false values. Otherwise, it will try to convert the payload to a logic value true/false (including "on" and "off" values, sent, for example, from HomeAssistant).<br/>

**Delay evaluation (ms)**

Delays the evaluation until this time (in milliseconds) is elapsed. Each time a message or "topic trigger message" (see **Trigger mode**) arrives, the delay is restarted.<br/>
This option is useful for debouncing pourposes or simply for adding some delay.<br/>
For example, you can turn on a light if the room is occupied for a long time, allowing people to fast transit repeatedly, without the need of turning the light on.<br/>
Another example, if you have many sensors changing state rapidly, you can wait until these sensor reach a quiet state, then evaluate the inputs.<br/>

**INPUT MSG TO THE NODE**

<code>
msg.reset = true;
</code>
Resets all inputs to undefined.

<br/>
<br/>
<br/>
<br/>
<br/>

# INTERRUPT FLOWS ULTIMATE

**Trigger by topic**

Whenever the node receives a payload = false from this topic,it stops output messages to the flow.<br/>
As soon it receives payload = true from this topic, the output messages start to flow out again. <br/>
The node will output the current stored message plus an added property "isReplay = true", as soon as it receives a ***msg.play = true*** from this topic.<br/>
The node will clear the current stored message, as soon as it receives a ***msg.reset = true*** from this topic.<br/>
The node tries to convert any arbitrary input value to a valid boolean value. It converts Homeassistant ***"on"*** and ***"off"*** to true/false values as well.<br/>

**Then** 
This property, allow you to auto toggle the selected start state (pass or block) after a timer has elapsed. You can choose from some pre-defined delays. If you have, for example, an Homekit-Bridged nodeset with a thermostat node or security system node in your flow, once node-red restarts, these homekit nodes output a default message to the flow. Just put an InterruptFlow node with a "block at start" behaviour and a toggle delay enabled behind homekit nodes, to temporary stop the chained nodes to receive the unwanted startup message.</br>
</br>

**INPUT MSG HWITH "TRIGGER" TOPIC**

Pass <code>msg.payload = true</code> to allow messages to pass through</br>
Pass <code>msg.payload = false</code> to prevent messages from passing through</br>
Pass <code>msg.play = true</code> from a message having the "trigger" topic, to replay the last stored message</br>
Pass <code>msg.reset = true</code> from a message having the "trigger" topic, to clear the last stored message</br>

<code>
// Assume you set the "trigger by topic" field to "trigger" 
// This code replays the last message and adds the property msg.isReplay = true to the output message.
msg.topic = "trigger"
msg.play = true;
</code>

<code>
// Assume you set the "trigger by topic" field to "trigger" 
// This code clears the last stored message
msg.topic = "trigger"
msg.reset = true;
</code>

</br>

See the example below.<br/>

<img src='https://raw.githubusercontent.com/Supergiovane/node-red-contrib-boolean-logic-ultimate/master/img/if0.png' width='60%'>

<details><summary>CLICK HERE, copy and paste it into your flow</summary>
<code>
[{"id":"1fd91f1f.c1fae9","type":"InterruptFlowUltimate","z":"96f56ceb91657677","name":"Interrupt Flow","triggertopic":"IsNight","initializewith":"1","autoToggle":"0","x":420,"y":200,"wires":[["b9844c7f.0f306"]]},{"id":"eaa32462.398808","type":"comment","z":"96f56ceb91657677","name":"Motion sensor to switch on stairs light, only if it's night, using flow interruption","info":"","x":350,"y":160,"wires":[]},{"id":"10787f38.edfe81","type":"inject","z":"96f56ceb91657677","name":"","repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"IsNight","payload":"true","payloadType":"bool","x":170,"y":300,"wires":[["1fd91f1f.c1fae9"]]},{"id":"a6092a15.1c592","type":"inject","z":"96f56ceb91657677","name":"","repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"IsNight","payload":"false","payloadType":"bool","x":170,"y":340,"wires":[["1fd91f1f.c1fae9"]]},{"id":"21ba9c30.02abbc","type":"comment","z":"96f56ceb91657677","name":"Brightness sensor","info":"","x":170,"y":260,"wires":[]},{"id":"af131ae5.a1bfb8","type":"inject","z":"96f56ceb91657677","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"MotionSensor","payload":"true","payloadType":"bool","x":190,"y":200,"wires":[["1fd91f1f.c1fae9"]]},{"id":"b9844c7f.0f306","type":"debug","z":"96f56ceb91657677","name":"Temporized Stairs Lightbulb","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","x":660,"y":200,"wires":[]},{"id":"a5305f8bef578897","type":"comment","z":"96f56ceb91657677","name":"Temporary stop the flow, with Toggle","info":"","x":220,"y":440,"wires":[]},{"id":"ffc9d3b9d17bc07b","type":"InterruptFlowUltimate","z":"96f56ceb91657677","name":"Interrupt Flow with toggle","triggertopic":"trigger","initializewith":"0","autoToggle":"20","x":400,"y":480,"wires":[["14a72f83f29bb347"]]},{"id":"398548646f66c457","type":"inject","z":"96f56ceb91657677","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"1","crontab":"","once":true,"onceDelay":0.1,"topic":"","payloadType":"date","x":170,"y":480,"wires":[["ffc9d3b9d17bc07b"]]},{"id":"14a72f83f29bb347","type":"debug","z":"96f56ceb91657677","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","statusVal":"","statusType":"auto","x":630,"y":480,"wires":[]}]
</code>
</details>

<br/>

In this other example, you can see the property "play" in action. This property allow you to replay the last previously stored message.<br/>
This allow to save the state of a node and then replay it back whenever you want.<br/>

<img src='https://raw.githubusercontent.com/Supergiovane/node-red-contrib-boolean-logic-ultimate/master/img/if1.png' width='60%'>

<details><summary>CLICK HERE, copy and paste it into your flow</summary>
<code>
[{"id":"9839dd47.81b2c8","type":"InterruptFlowUltimate","z":"1337569a6adbb2e3","name":"Interrupt Flow","triggertopic":"trigger","initializewith":"1","autoToggle":"0","x":580,"y":300,"wires":[["d371d690.1e2fe8"]]},{"id":"568deb73.394fb4","type":"comment","z":"1337569a6adbb2e3","name":"1) Push buttons to change values","info":"","x":190,"y":140,"wires":[]},{"id":"e1c9f10a.0ba518","type":"inject","z":"1337569a6adbb2e3","name":"ALLOW","repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"trigger","payload":"true","payloadType":"bool","x":130,"y":360,"wires":[["9839dd47.81b2c8"]]},{"id":"82ba24f9.0f0bd8","type":"inject","z":"1337569a6adbb2e3","name":"INTERRUPT","repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"trigger","payload":"false","payloadType":"bool","x":150,"y":320,"wires":[["9839dd47.81b2c8"]]},{"id":"23ba4f9c.86de9","type":"comment","z":"1337569a6adbb2e3","name":"2) Push INTERRUPT, then try again to change value (1)","info":"","x":260,"y":280,"wires":[]},{"id":"24671ef2.4519e2","type":"inject","z":"1337569a6adbb2e3","name":"","repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"true","payloadType":"bool","x":130,"y":180,"wires":[["9839dd47.81b2c8"]]},{"id":"d371d690.1e2fe8","type":"debug","z":"1337569a6adbb2e3","name":"Debug","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","x":750,"y":300,"wires":[]},{"id":"409ec415.735d74","type":"inject","z":"1337569a6adbb2e3","name":"REPLAY","repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"trigger","payload":"","payloadType":"str","x":140,"y":460,"wires":[["6653ed0.7186014"]]},{"id":"6653ed0.7186014","type":"change","z":"1337569a6adbb2e3","name":"Play","rules":[{"t":"set","p":"play","pt":"msg","to":"true","tot":"bool"}],"action":"","property":"","from":"","to":"","reg":false,"x":270,"y":460,"wires":[["9839dd47.81b2c8"]]},{"id":"e957a069.0ac458","type":"inject","z":"1337569a6adbb2e3","name":"","repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"false","payloadType":"bool","x":130,"y":220,"wires":[["9839dd47.81b2c8"]]},{"id":"8f0af608.8fb45","type":"comment","z":"1337569a6adbb2e3","name":"3) Replay last message stored by the node","info":"","x":220,"y":420,"wires":[]},{"id":"46e6f455.0023ac","type":"comment","z":"1337569a6adbb2e3","name":"You can use Interruptflow, to save the state of a node, and then replay the last state as you want.","info":"","x":390,"y":100,"wires":[]}]
</code>
</details>

<br/>
<br/>
<br/>
<br/>
<br/>

# INVERT ULTIMATE

Outputs the inverted input. For example true -> false<br />
The input message is preserved and passed to the output pin, changing only the topic and the payload. If the input message has it's own topic, it'll be preserved as well.<br/>
The node tries to convert any arbitrary input value to a valid boolean value. It converts Homeassistant ***"on"*** and ***"off"*** to true/false values as well.<br/>

<br/>
<br/>
<br/>
<br/>
<br/>

# FILTER ULTIMATE

This node has 2 outputs.<br />
If the input payload is true, the node will send <code>true</code> on output 1 and nothing on oputput 2<br />
If the input payload is false, the node will send nothing on output 1, and <code>false</code> on oputput 2<br />
The input message is preserved and passed to the output pin, changing only the topic and the payload. If the input message has it's own topic, it'll be preserved as well.<br/>
The node tries to convert any arbitrary input value to a valid boolean value. It converts Homeassistant ***"on"*** and ***"off"*** to true/false values as well.<br/>

<br/>
<br/>
<br/>
<br/>
<br/>

# BLINKER ULTIMATE

The pourpose of this node is to blink a led or something.<br />
Output PIN1 : outputs the value true/false<br/>
Output PIN2 : outputs the inverted value false/true<br/>
<br/>

Pass <code>msg.payload = true</code> to start blinking</br>
Pass <code>msg.payload = false</code> to stop blinking</br>
Pass <code>msg.interval = 2000</code> to change the blinking interval</br>

- PIN1 stop behavior : when the blinker receives the stop message, you can select the behavior of the pin1<br/>
- PIN2 stop behavior : when the blinker receives the stop message, you can select the behavior of the pin2<br/>


<img src='https://raw.githubusercontent.com/Supergiovane/node-red-contrib-boolean-logic-ultimate/master/img/blinker.png' width='60%'>

<details><summary>CLICK HERE, copy and paste it into your flow</summary>
<code>
[{"id":"33d76f42.58e088","type":"BlinkerUltimate","z":"c3456bd7.8ee9d8","name":"Blinker","blinkfrequency":"500","x":260,"y":340,"wires":[["ad7488b.2a1d9f8"]]},{"id":"ac0d404f.70cc","type":"inject","z":"c3456bd7.8ee9d8","name":"","topic":"","payload":"true","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":90,"y":320,"wires":[["33d76f42.58e088"]]},{"id":"bfdc64c6.06e2d","type":"inject","z":"c3456bd7.8ee9d8","name":"","topic":"","payload":"false","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":90,"y":360,"wires":[["33d76f42.58e088"]]},{"id":"ad7488b.2a1d9f8","type":"debug","z":"c3456bd7.8ee9d8","name":"Led","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","x":410,"y":340,"wires":[]},{"id":"865e29f9.4d1e98","type":"comment","z":"c3456bd7.8ee9d8","name":"Blink a signalling led","info":"","x":110,"y":280,"wires":[]}]
</code>
</details>

<br/>
<br/>
<br/>
<br/>
<br/>

# SIMPLE OUTPUT ULTIMATE

The pourpose of this node is to send a message with payload TRUE on the first pin and FALSE on second pin, independently from the msg input.<br />
This is useful if you need to simply send a true or false payload.

<img src='https://raw.githubusercontent.com/Supergiovane/node-red-contrib-boolean-logic-ultimate/master/img/SimpleOutput.png' width='60%'>

<details><summary>CLICK HERE, copy and paste it into your flow</summary>
<code>
[{"id":"e1149e22.c9b298","type":"inject","z":"81a64dae.012c18","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":100,"y":820,"wires":[["6a419c72.5a4e7c"]]},{"id":"6a419c72.5a4e7c","type":"SimpleOutputUltimate","z":"81a64dae.012c18","name":"T/F","x":290,"y":820,"wires":[["8ba3f611.26beb8"],["b469193b.950598"]]},{"id":"8ba3f611.26beb8","type":"debug","z":"81a64dae.012c18","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","x":530,"y":800,"wires":[]},{"id":"b469193b.950598","type":"debug","z":"81a64dae.012c18","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","x":530,"y":840,"wires":[]},{"id":"2451f593.04e62a","type":"comment","z":"81a64dae.012c18","name":"Whatever the input is, output msg with payload TRUE on first and FALSE on second pin.","info":"","x":330,"y":760,"wires":[]}]
</code>
</details>

<br/>
<br/>
<br/>
<br/>
<br/>

# INJECT ULTIMATE

The pourpose of this node is to send a message with payload TRUE on the first pin, FALSE on second pin and a TOGGLE (true/false) on the third pin, by pressing the pushbutton.<br />
This is useful if you need to simply test your flow. The node is simpler as the default node-red inject node.

<img src='https://raw.githubusercontent.com/Supergiovane/node-red-contrib-boolean-logic-ultimate/master/img/Inject.png' width='60%'>

<details><summary>CLICK HERE, copy and paste it into your flow</summary>
<code>
[{"id":"13faaec9.cd80b9","type":"InjectUltimate","z":"81a64dae.012c18","name":"True","x":110,"y":1000,"wires":[["6557d19.c71abb"],[],[]]},{"id":"6557d19.c71abb","type":"debug","z":"81a64dae.012c18","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","x":370,"y":1080,"wires":[]},{"id":"569b3820.b056e8","type":"InjectUltimate","z":"81a64dae.012c18","name":"False","x":110,"y":1080,"wires":[[],["6557d19.c71abb"],[]]},{"id":"189399f.c384f66","type":"InjectUltimate","z":"81a64dae.012c18","name":"Toggle","x":110,"y":1160,"wires":[[],[],["6557d19.c71abb"]]},{"id":"56119644.8c4bf8","type":"comment","z":"81a64dae.012c18","name":"Inject Ultimate. Simple and efficient.","info":"","x":180,"y":940,"wires":[]}]
</code>
</details>

<br/>
<br/>
<br/>
<br/>
<br/>

# STATUS ULTIMATE

The pourpose of this node is to show a status of the passingthrough message.<br />

**Show msg.**

- Write here the property you want to get the status from. For example, "payload", "mycar.color", etc.

<img src='https://raw.githubusercontent.com/Supergiovane/node-red-contrib-boolean-logic-ultimate/master/img/Status.png' width='60%'>

<details><summary>CLICK HERE, copy and paste it into your flow</summary>
<code>
[{"id":"8c1648bf.58e6","type":"StatusUltimate","z":"5c2de561.6a0de4","name":"Status","property":"testobject.color","x":90,"y":180,"wires":[["b96cd259.3f8398"]]},{"id":"3beb9c6.90d1e64","type":"function","z":"5c2de561.6a0de4","name":"Dummy msg","func":"msg.payload = \"The payload is \" + msg.payload;\nmsg.myproperty = \"This is my custom property\";\nmsg.testobject = {len : 100, color : \"blue\"};\nreturn msg;","outputs":1,"noerr":0,"initialize":"","finalize":"","libs":[],"x":230,"y":100,"wires":[["8c1648bf.58e6"]]},{"id":"84080b79.df3f38","type":"debug","z":"5c2de561.6a0de4","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":710,"y":180,"wires":[]},{"id":"b534d2ec.635398","type":"InjectUltimate","z":"5c2de561.6a0de4","name":"Inject","topic":"1","curVal":true,"x":90,"y":100,"wires":[[],[],["3beb9c6.90d1e64"]]},{"id":"9745c77a.0361b","type":"comment","z":"5c2de561.6a0de4","name":"View the status of a message passing through the StatusUltimate node","info":"","x":270,"y":40,"wires":[]},{"id":"b96cd259.3f8398","type":"StatusUltimate","z":"5c2de561.6a0de4","name":"Status","property":"payload","x":230,"y":180,"wires":[["ac2b784b.b44a48"]]},{"id":"ac2b784b.b44a48","type":"StatusUltimate","z":"5c2de561.6a0de4","name":"Status","property":"myproperty","x":450,"y":180,"wires":[["84080b79.df3f38"]]}]
</code>
</details>
<br/>
<br/>
<br/>
<br/>
<br/>

# IMPULSE ULTIMATE

The pourpose of this node is to send a sequence of pulsed commands to for example, open a garage door or to command an appliance requiring a set of timed commands.<br />

<img src='https://raw.githubusercontent.com/Supergiovane/node-red-contrib-boolean-logic-ultimate/master/img/Impulse.png' width='60%'>
<details><summary>CLICK HERE, copy and paste it into your flow</summary>
<code>
[{"id":"6fc25e59990d5955","type":"ImpulseUltimate","z":"5ed79f4a958a1f20","name":"Turn on the fan at level 1","commandText":"// Turn on the fan (must be sent as first command ever\n// even if the fan is already off)\nsend:true\nwait:300\nsend:false\nwait:3000\n// Reset the fan\nsend:true\nwait:2000\nsend:false\nwait:3000\n// Speed 1\nsend:true\nwait:300\nsend:false","x":410,"y":140,"wires":[["7a2ea180e17e513c"]]},{"id":"0d7de5c606ecaf92","type":"InjectUltimate","z":"5ed79f4a958a1f20","name":"START THE FAN","topic":"1","curVal":true,"x":130,"y":120,"wires":[["6fc25e59990d5955"],[],[]]},{"id":"7a2ea180e17e513c","type":"debug","z":"5ed79f4a958a1f20","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":620,"y":140,"wires":[]},{"id":"333733dffda4dc56","type":"InjectUltimate","z":"5ed79f4a958a1f20","name":"BLOCK SCRIPT","topic":"1","curVal":true,"x":130,"y":200,"wires":[[],["6fc25e59990d5955"],[]]},{"id":"cdae7e4bc0835e4f","type":"comment","z":"5ed79f4a958a1f20","name":"This example turns on a \"LucePlan Blow\" fan and set it's speed to 1","info":"","x":260,"y":60,"wires":[]}]
</code>
</details>

**Avaiable Commands**<br />
Commands are to be wrote in the format: command:value. For example ***send:200***, ***wait:2000***. Each row represents a command.<br />
<br /><b>send</b><br />
sends a value. For example: ***send:true*** or ***send:100*** or ***send:Hello***<br />
<br /><b>wait</b><br />
wait for specified time (in milliseconds). For example ***wait:500*** waits for 500 milliseconds<br />
<br /><b>restart</b><br />
Restart the sequence from the beginning. Use ***restart*** alone, without **:** and extra value. For example ***restart*** <br />
<br /><b>//</b><br />
comment. For example: ***// This opens the garage***. The comment are ignored, so you can write what you want.<br />
<br />

Pass <code>msg.payload = true</code> to the node to start the sequence</br>
Pass <code>msg.payload = false</code> to the node to stop the running sequence</br>
<br />

- Output: the node outputs a message you specified in the command textbox<br/>

<br/>
<br/>
<br/>
<br/>
<br/>

# SUM ULTIMATE

The pourpose of this node is to sum the incoming values. Each incoming message MUST HAVE OWN TOPIC.<br />

<img src='https://raw.githubusercontent.com/Supergiovane/node-red-contrib-boolean-logic-ultimate/master/img/sum.png' width='60%'>
<details><summary>CLICK HERE, copy and paste it into your flow</summary>
<code>
[{"id":"05b6ce0cb476abd5","type":"SumUltimate","z":"d8fbf871e381cf2c","name":"Sum","property":"payload","x":550,"y":160,"wires":[["567aa6a9719e463e","34fbca5daf8b9fab","e3c2a45a0b77af8f"]]},{"id":"6744e01b88d820b9","type":"inject","z":"d8fbf871e381cf2c","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"Watt Table Lamp","payload":"10","payloadType":"num","x":250,"y":140,"wires":[["05b6ce0cb476abd5"]]},{"id":"75823dbc7db78c3c","type":"inject","z":"d8fbf871e381cf2c","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"Watt Washing machine","payload":"20","payloadType":"num","x":270,"y":180,"wires":[["05b6ce0cb476abd5"]]},{"id":"567aa6a9719e463e","type":"debug","z":"d8fbf871e381cf2c","name":"Sum","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","statusVal":"","statusType":"auto","x":690,"y":160,"wires":[]},{"id":"1793931ba218bc1d","type":"inject","z":"d8fbf871e381cf2c","name":"Reset","props":[{"p":"reset","v":"","vt":"date"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":210,"y":240,"wires":[["05b6ce0cb476abd5"]]},{"id":"0b3277af03f546d4","type":"comment","z":"d8fbf871e381cf2c","name":"Getting Sum, Average etc. from the SUM node.","info":"","x":320,"y":100,"wires":[]},{"id":"34fbca5daf8b9fab","type":"debug","z":"d8fbf871e381cf2c","name":"Average","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"average","targetType":"msg","statusVal":"","statusType":"auto","x":700,"y":200,"wires":[]},{"id":"e3c2a45a0b77af8f","type":"debug","z":"d8fbf871e381cf2c","name":"Measurements","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"measurements","targetType":"msg","statusVal":"","statusType":"auto","x":720,"y":240,"wires":[]}]
</code>
</details>

**INPUT**<br />

<br /><b>msg.reset</b><br />
resets the values to zero.

<br />

- Output: the node outputs a message as follows:<br/>

<pre>
{
  "payload": 30, // This is the SUM
  "topic": "Sum", // Node  Topic
  "average": 15, // This is the AVERAVE
  "measurements": 2 // This is the number of topics that have been evaluated
}
</pre>

br/>
<br/>
<br/>
<br/>
<br/>

# TOGGLE ULTIMATE

The pourpose of this node is to toggle between true/false the payload of every incoming message.<br />


**INPUT**<br />

Any message that arrives on input, will be passwd through to the output with the payload toggled between true and false.



[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://github.com/Supergiovane/node-red-contrib-boolean-logic-ultimate/master/LICENSE
[npm-url]: https://npmjs.org/package/node-red-contrib-boolean-logic-ultimate
[npm-version-image]: https://img.shields.io/npm/v/node-red-contrib-boolean-logic-ultimate.svg
[npm-downloads-month-image]: https://img.shields.io/npm/dm/node-red-contrib-boolean-logic-ultimate.svg
[npm-downloads-total-image]: https://img.shields.io/npm/dt/node-red-contrib-boolean-logic-ultimate.svg
[facebook-image]: https://img.shields.io/badge/Visit%20me-Facebook-blue
[facebook-url]: https://www.facebook.com/supergiovaneDev