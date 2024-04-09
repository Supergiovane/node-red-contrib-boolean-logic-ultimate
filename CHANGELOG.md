# node-red-contrib-boolean-logic-ultimate
[![Donate via PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg?style=flat-square)](https://www.paypal.me/techtoday) 

# CHANGELOG

<p>
<b>Version 1.1.7</b> April 2024<br/>
- Math node: <b>BREAKING CHANGE</b>: in SUBTRACT mode, now you must set a msg.topic to start subtracting from.</br>
</p>
<p>
<b>Version 1.1.5</b> April 2024<br/>
- Math node: fixed an issue with the "subtract" operator. See contestual help in the node-red help tab.</br>
</p>
<p>
<b>Version 1.1.3</b> March 2024<br/>
- Comparator node: NEW: you can now reset both input values to *undefined*, by sending **msg.reset = true**.</br>
</p>
<p>
<b>Version 1.1.2</b> January 2024<br/>
- NEW: added "normal" and "violated" as default accepted inputs, for compatibility with Home Assistant.</br>
</p>
<p>
<b>Version 1.1.1</b> October 2023<br/>
- Math node: FIX: fixed "measurement" and "average" not showing correct results when using the "subtract" option. Thanks to @VanillaFord</br>
</p>
<p>
<b>Version 1.1.0</b> September 2023<br/>
- NEW: Translator config node. Each boolean logic node can now translate the input payload to a boolean value. For example, you can add "done:true" to the translation table, to convert the input payload "done", to a boolean <i>TRUE</> value.</br>
</p>
<p>
<b>Version 1.0.63</b> September 2023<br/>
- NEW: Comparator node. Compare the values from 2 input messages.</br>
</p>
<p>
<b>Version 1.0.62</b> August 2023<br/>
- Math node: added "subtract option".</br>
</p>
<p>
<b>Version 1.0.61</b> Juli 2023<br/>
- Standardization of the help, based on Node-Red directives.</br>
- Updated the README</br>
</p>
<p>
<b>Version 1.0.60</b> March 2023<br/>
- FIX: Fixed some little issues to the Railways Node and fixed the youtube video not having audio https://youtu.be/iPVyiwDIUMg. 
</p>
<p>
<b>Version 1.0.59</b> January 2023<br/>
- NEW: added msg.gatecount property, to dinamically change the gate input count.</br>
- Updated the README</br>
</p>
<p>
<b>Version 1.0.58</b> December 2022<br/>
- NEW: added string conversion from "home", "not_home" to boolean.</br>
- Updated the README</br>
</p>
<p>
<b>Version 1.0.57</b> September 2022<br/>
- Added node help in the node-red help tab.</br>
</p>
<p>
<b>Version 1.0.56</b> August 2022<br/>
- NEW: added string conversion from "true", "false", "0", "1", "close" to boolean.</br>
- Updated the README</br>
</p>
<p>
<b>Version 1.0.55</b> July 2022<br/>
- NEW: you can now specify the input property name from witch the node picks up the payload.</br>
- NEW: added more Homeassistant string compatibility values.</br>
- Updated the README</br>
</p>
<p>
<b>Version 1.0.53</b> June 2022<br/>
- NEW: Math Ultimate. The old "Sum" node, now has become a math node, you can peform multipication other than sum.</br>
- Updated README with samples of Math node.
</p>
<p>
<b>Version 1.0.52</b> Mai 2022<br/>
- NEW: Railway Switcher Ultimate: new node to switch the input message to an output pin (https://youtu.be/iPVyiwDIUMg).</br>
- Updated README with samples of Railway Switch node.
</p>
<p>
<b>Version 1.0.51</b> February 2022<br/>
- Blinker Ultimate: fixed minor problem with an orphan timer.</br>
- Better scoping of some vars, to leave the memory garbace collector to get rid of unused references.</br>
</p>
<p>
<b>Version 1.0.50</b> February 2022<br/>
- NEW: Added Youtube example for each node. You can find the link in the config window of each one and hede the playlist https://youtube.com/playlist?list=PL9Yh1bjbLAYoRH4IyQB7EL5srHAihiKpy.</br>
</p>
<p>
<b>Version 1.0.48</b> February 2022<br/>
- NEW: TOGGLE node: Simple toggle node.</br>
</p>
<p>
<b>Version 1.0.48</b> February 2022<br/>
- NEW: SUM node: this new node makes sum, average and measurement count.</br>
</p>
<p>
<b>Version 1.0.47</b> February 2022<br/>
- NEW: Interrupt Flow: the node now stores the last message, even if in the "stop" state.</br>
</p>
<p>
<b>Version 1.0.46</b> February 2022<br/>
- NEW: Interrupt Flow: msg.reset will delete the stored message.</br>
- Updated the README file with samples.</br>
</p>
<p>
<b>Version 1.0.45</b> February 2022<br/>
- NEW: Interrupt Flow: Now you can auto-toggle the startup behavior selection (to stop or to pass telegrams) after some pre-defined delays.</br>
- Updated the README file with samples.</br>
</p>
<p>
<b>Version 1.0.44</b> February 2022<br/>
- Boolean Logic Ultimate: Added the "d" indication, in the node's name, when the delay option is enabled.</br>
- Boolean Logic Ultimate: Refined the UI.</br>
</p>
<p>
<b>Version 1.0.41</b> January 2022<br/>
- Boolean Logic Ultimate: UI optimization and remove warning triangle if the delay is not set.</br>
</p>
<p>
<b>Version 1.0.40</b> January 2022<br/>
- NEW: Boolean Logic Ultimate: Delay option added. See the readme on gitHub.</br>
</p>
<p>
<b>Version 1.0.39</b> November 2021<br/>
- FIX a possible issue when msg.payload is numeric.</br>
</p>
<p>
<b>Version 1.0.38</b> November 2021<br/>
- All nodes does accept "on" and "off" as input, converting it in "true" and "false" values (Homeassistant friendly).</br>
</p>
<p>
<b>Version 1.0.36</b> November 2021<br/>
- ImpulseUltimate: NEW: added <b>restart</b> command, to restart the sequence from scratch.</br>
</p>
<p>
<b>Version 1.0.35</b> November 2021<br/>
- Filterultimate and Invertultimate: added others checks to avoid processing invalid/non boolean convertible payloads and notify it in the node status.</br>
</p>
<p>
<b>Version 1.0.34</b> August 2021<br/>
- NEW: Impulse node: you run issue a sequence of commands to, for example, open a garage door with a timed impulse, or switch speed of a fan requiring pulsed commands. Check the gitHub home for sample and explanation.</br>
</p>
<p>
<b>Version 1.0.32</b> August 2021<br/>
- Interruptflow ultimate: fixed an issue involving messages without topic.</br>
</p>
<p>
<b>Version 1.0.31</b> August 2021<br/>
- NEW: Boolean-Logic-Ulimate can now strict filter for input payload, by accepting only boolean true/false values. If the option is not enabled, the node will continue to try to transform the input payload to a suitable boolean value.</br>
</p>
<p>
<b>Version 1.0.29</b> May 2021<br/>
- NEW: StatusUltimate node: show the status of the passing-through message.</br>
</p>
<p>
<b>Version 1.0.28</b> May 2021<br/>
- Fixed some hiccups in checking if a msg.payload is boolean.</br>
</p>
<p>
<b>Version 1.0.27</b> April 2021<br/>
- Boolean logic ultimate: msg.reset = true now resets all inputs.</br>
- Update the help in the README to reflect the changes.</br>
</p>
<p>
<b>Version 1.0.26</b> April 2021<br/>
- NEW: Interrupt Flow: now you can choose the default state at start, between true (allow telegrams flow) and false (block telegrams flow).</br>
- Blinker: fixed bug in default dropdownbox selection whenever the node was dropped on the flow.</br>
- NEW: Blinker: added autostart option.</br>
</p>
<p>
<b>Version 1.0.25</b> February 2021<br/>
- BlinkerUltimate: added second output pin that emits an inverted payload.</br>
- BlinkerUltimate: Now you can select to send true or false on both pins once the blinker has been stopped.</br>
</p>
<p>
<b>Version 1.0.24</b> January 2021<br/>
- Maintenance release: added help links in the property windows and renamed the first property to be more clear.</br>
</p>
<p>
<b>Version 1.0.23</b> November 2020<br/>
- BUGFIX: Inject Node was not retaining the topic value you set. Fixed.</br>
- Inject Node: clearer status indication.
</p>
<p>
<b>Version 1.0.22</b> October 2020<br/>
- Changed the way to handle the presistent states. This allow the node to correctly save the states in non standard node-red installations (docker, home-assistant plugin etc). Thanks @Botched1 for raising the issue.</br>
- Automatic migration of persistens states from the old to the new path.</br>
- Moved the inject node in the "common" node-red group.
</p>
<p>
<b>Version 1.0.20</b> August 2020<br/>
- NEW: Inject Node. The pourpose of this node is to speed up the testing of you flow, by issuing true/false command by pushbutton on the node itself. This node is simpler as the default node-red inject node.</br>
</p>
<p>
<b>Version 1.0.19</b> August 2020<br/>
- NEW: Simple Output node. The pourpose of this node is to send a message with payload TRUE on the first pin and FALSE on second pin, independently from the msg input.</br>
</p>
<p>
<b>Version 1.0.18</b> August 2020<br/>
- Boolean Logic: warn user if either topic or payload are not set. You must always set a topic and payload.</br>
</p>
<p>
<b>Version 1.0.17</b> June 2020<br/>
- Interruptflowultimete: State save/replay. Msg.play = true sends the current payload See the README on github for an example.</br>
</p>
<p>
<b>Version 1.0.16</b> May 2020<br/>
- BlinkerUltimate: if you set the interval while the blinker is running, yet the new interval is applied immediately.</br>
</p>
<p>
<b>Version 1.0.15</b> May 2020<br/>
- Adjusted status of Boolean Logic ultimate. Replaced the text "null", with --- for better understanding.</br>
</p>
<p>
<b>Version 1.0.14</b><br/>
- NEW: added blinker node. Thanks to @Marco for the suggestion.</br>
</p>
<p>
<b>Version 1.0.12</b><br/>
- Boolean Logic, FilterUltimate and InvertUltimate now output the entire message input, replacing only topic and payload.</br>
</p>
<p>
<p>
<b>Version 1.0.11</b><br/>
- Enhanced help.</br>
</p>
<p>
<b>Version 1.0.10</b><br/>
- Fix a possible issue in the "Interrupt Flow", if the trigger topic contains special characters.</br>
</p>
<p>
<b>Version 1.0.9</b><br/>
- Added "Interrupt Flow" node. Whenever the node receives a payload = false from a specific topic, it stops output messages to the flow. As soon it receives payload = true from this topic, the output messages start to flow out again.</br>
</p>
<p>
<b>Version 1.0.8</b><br/>
- Updated Help
</p>
<p>
<b>Version 1.0.7</b><br/>
- Node node shows "f" when "filter true" is selected and "t" (triggername) when "trigger only by single topic" is selected.<br/>
</p>
<p>
<b>Version 1.0.6</b><br/>
- Stripped out the date/time in node status<br/>
</p>
<p>
<b>Version 1.0.5</b><br/>
- Added the Last value change date/time in the status.<br/>
- Correction in the in-line help<br/>
- Better format of the README.md<br/>
</p>
<p>
<b>Version 1.0.4</b><br/>
- Added the option to initialize the undefined inputs with true or false. Thanks to this, the node is immediately operative (will not wait until all topis arrives).<br/>
</p>
<p>
<b>Version 1.0.3</b><br/>
- Node status: cosmetic adjustments<br/>
</p>
<p>
<b>Version 1.0.2</b><br/>
- Added "trigger mode" option (fixed UI glitch)<br/>
</p>
<p>
<b>Version 1.0.1</b><br/>
- Added "trigger mode" option<br/>
</p>
<p>
<b>Version 1.0.0</b><br/>
- Added Filter node<br/>
</p>
<p>
<b>Version 0.0.8</b><br/>
- Delete persistent states when a new unexpected topic arrrives<br/>
- Better status representation<br/>
- Better and clearer configuration UI <br/>
</p>
<p>
<b>Version 0.0.7</b><br/>
- Fixed decimal error in the "Invert" node.<br/>
</p>
<p>
<b>Version 0.0.6</b><br/>
- Fixed crappy "Invert" node.<br/>
</p>
<p>
<b>Version 0.0.5</b><br/>
- Bypass persistency if node-red user hasn't permissions to write to the filesystem.<br/>
</p>
<p>
<b>Version 0.0.4</b><br/>
- Fixed conflict issue if you have the old boolean logic installed<br/>
</p>
<p>
<b>Version 0.0.3</b><br/>
- Fixed status display<br/>
</p>
<p>
<b>Version 0.0.2</b><br/>
- Fixed persistent state deletion upon node update/delete<br/>
</p>
<p>
<b>Version 0.0.1</b><br/>
- Initial release<br/>
</p>