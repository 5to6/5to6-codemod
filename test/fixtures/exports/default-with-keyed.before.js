// in this case we can mix `default` and the others
module.exports = function thing() {};
module.exports.horse = "morse";

// more or less the same as above
exports = module.exports = function() {};
exports.CONSTANT_NAME = 'HOUSE';
module.exports.isAnnoying = true;
