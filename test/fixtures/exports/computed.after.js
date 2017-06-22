var constants = {};

var exports = {
    'testkey': 'testvalue'
};

export default exports;

Object.keys(constants).forEach(function (key) {
    if (key.indexOf('ERR_') === 0) {
        exports[key] = constants[key]; // this line will be converted wrong
        module.exports[key] = constants[key]; // this line will be converted wrong
    }
});
