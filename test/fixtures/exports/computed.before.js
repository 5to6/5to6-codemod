var constants = {};

var exports = module.exports = {
    'testkey': 'testvalue'
};

Object.keys(constants).forEach(function (key) {
    if (key.indexOf('ERR_') === 0) {
        exports[key] = constants[key]; // this line will be converted wrong
        module.exports[key] = constants[key]; // this line will be converted wrong
    }
});
