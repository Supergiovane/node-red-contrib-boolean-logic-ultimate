module.exports.ToBoolean = function ToBoolean(value, _configTranslationNode) {
  let res = false;
  let decimal = /^\s*[+-]{0,1}\s*([\d]+(\.[\d]*)*)\s*$/;

  if (typeof value === "boolean") {
    return value;
  } else if (typeof value === "string") {
    try {
      let translationTable = [];
      value = value.toLowerCase();
      if (_configTranslationNode === null) {
        translationTable = DEFAULTTRANSLATIONINPUT.split("\n");
      } else {
        translationTable = _configTranslationNode.commandText.split("\n");
      }
      for (let index = 0; index < translationTable.length; index++) {
        // HA Style evaluation in the format "{{value>=0}}"
        let inputPayloadToBeTranslated = translationTable[index].toLowerCase().split(":")[0];
        if (inputPayloadToBeTranslated.indexOf("{{") > -1 && inputPayloadToBeTranslated.indexOf("}}") > -1) {
          // Eval content of the brackets {{value<=0}}, HA style
          inputPayloadToBeTranslated = inputPayloadToBeTranslated.replace("{{", "").replace("}}", "").replace("value", value); // Set the word value to real value
          if (eval(inputPayloadToBeTranslated)) {
            return translationTable[index].split(":")[1] === "true"
              ? true
              : false;
          } // Eval the operation
        } else if (
          // Normal string value
          value === inputPayloadToBeTranslated
        ) {
          return translationTable[index].split(":")[1] === "true"
            ? true
            : false;
        }
      }
    } catch (error) {
      console.log("Boolean-Logic-Ultimate:utils:toBoolean: " + error.message);
    }
  } else if (typeof value === "number") {
    // Is it formated as a decimal number?
    if (decimal.test(value)) {
      res = parseFloat(value) != 0;
    } else {
      res = value.toLowerCase() === "true";
    }
    return res;
  }
};

module.exports.ToAny = function ToAny(value, _configTranslationNode) {

  try {
    let translationTable = [];
    if (_configTranslationNode === null) {
      // Don't do translation, because the default translation input may contin unwanted translations
      return value;
    } else {
      translationTable = _configTranslationNode.commandText.split("\n");
    }
    for (let index = 0; index < translationTable.length; index++) {
      let inputPayloadToBeTranslated = translationTable[index].split(":")[0];
      //let outputBoolean = Boolean(translationTable[index].split(":")[1]);
      if (
        String(value).toLowerCase() === inputPayloadToBeTranslated.toLowerCase() &&
        inputPayloadToBeTranslated.toLowerCase() !== ""
      ) {
        return translationTable[index].split(":")[1];
      }
    }
    return value;
  } catch (error) {
    console.log("Boolean-Logic-Ultimate:utils:toAny: " + error.message);
  }

};

module.exports.fetchFromObject = function fetchFromObject(
  _msg,
  _payloadPropName
) {
  // The output cannot be an oblect. In case, return undefined.
  var _index = _payloadPropName.indexOf(".");
  if (_index > -1) {
    return fetchFromObject(
      _msg[_payloadPropName.substring(0, _index)],
      _payloadPropName.substr(_index + 1)
    );
  }
  if (typeof _msg[_payloadPropName] === "object") return undefined;
  return _msg[_payloadPropName];
};
const DEFAULTTRANSLATIONINPUT =
  "on:true\noff:false\nactive:true\ninactive:false\nopen:true\nclosed:false\nclose:false\n1:true\n0:false\ntrue:true\nfalse:false\nhome:true\nnot_home:false\nnormal:false\nviolated:true";
