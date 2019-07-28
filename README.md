# node-red-contrib-boolean-logic
[Node-RED](http://nodered.org/) nodes to easily perform boolean logic. 

## The problem
[Node-RED](http://nodered.org/) does not support multiple inputs on nodes, and it has been discussed at length in [this thread](https://groups.google.com/forum/#!searchin/node-red/multiple$20inputs%7Csort:relevance/node-red/Q0YLQYCUJ_E/JVNjznmx2e8J). The TL;DR - as I understand it - is that the developers of NR argue that multiple inputs makes it too complex for users without a background in electrical engineering and that it is [preferred](https://groups.google.com/d/msg/node-red/Q0YLQYCUJ_E/DTxHFcVfAwAJ) users of NR instead use other means to create the desired logic (i.e. write Javascript in function-nodes).

## A solution
I really needed a simple and reusable way to perform boolean logic on multiple topics without the need to write the same code over and over. 

Could this be solved using a subflow? No, function-node within a subflow cannot be configured on an instance basis which is required as the logic must know how many inputs it is expecting when performing operations such as ```A || B``` or ```A && (B || C)```. Yes, that could be hard coded, but then it would not be reusable. Also, a subflow cannot use the status indicator which is a great help to the user.

What I came up with are the following nodes.
* BooleanLogic: Can perform AND, OR and XOR operations on ```msg.payload``` on any number of topics.
* Invert: Inverts the ```msg.payload```, e.g. true -> false.
* Debug: A debug node that displays the status direcly in the editor, making it easier to see the boolean value at a specific point.

All nodes attempts to convert the incoming ```msg.payload``` to a boolean value according to these rules:
* Boolean values are taken as-is.
* For numbers, 0 evaluates to false, all other numbers evaluates to true.
* Strings are converted to numbers if they match the format of a decimal value, then the same rule as for numbers are applied. If it does not match, it evaluates to false. Also, the string "true" evaluates to true.

### BooleanLogic
This node must be configured with the expected number of topics. It will not output a value until it has received the configured number of topics. Also, if it receives more than the configured number of topics it will reset (but not output a value) and wait until it once again sees the configured number of topics.

## Example
![Example](http://i.imgur.com/m2s6JRl.png)

## Version history
* 0.0.1	First release
* 0.0.2
  * Changed status indicators from dot to rings for false-values.
  * Reworked the conversion of input values to be consistent between numbers and strings with numeric meaning.
