module.exports.ToBoolean = function ToBoolean(value) {
    let res = false;
    let decimal = /^\s*[+-]{0,1}\s*([\d]+(\.[\d]*)*)\s*$/

    if (typeof value === 'boolean') {
        return value;
    } else if (typeof value === 'string') {

        if (value.toLowerCase() === "on") return true;
        if (value.toLowerCase() === "off") return false;

        if (value.toLowerCase() === "active") return true;
        if (value.toLowerCase() === "inactive") return false;

        if (value.toLowerCase() === "open") return true;
        if (value.toLowerCase() === "closed") return false;
        if (value.toLowerCase() === "close") return false;

        if (value.toLowerCase() === "1") return true;
        if (value.toLowerCase() === "0") return false;

        if (value.toLowerCase() === "true") return true;
        if (value.toLowerCase() === "false") return false;

        if (value.toLowerCase() === "home") return true;
        if (value.toLowerCase() === "not_home") return false;

    } else if (typeof value === 'number') {
        // Is it formated as a decimal number?
        if (decimal.test(value)) {
            res = parseFloat(value) != 0;
        }
        else {
            res = value.toLowerCase() === "true";
        }
        return res;
    }
};

module.exports.fetchFromObject = function fetchFromObject(_msg, _payloadPropName) {
    // The output cannot be an oblect. In case, return undefined.
    var _index = _payloadPropName.indexOf('.')
    if (_index > -1) {
        return fetchFromObject(_msg[_payloadPropName.substring(0, _index)], _payloadPropName.substr(_index + 1));
    }
    if (typeof _msg[_payloadPropName] === "object") return undefined;
    return _msg[_payloadPropName];
};
