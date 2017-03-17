// should be export default
module.exports = { a: 'a' };

// should be `export const` or `export function`
exports.things = "a";
exports.thunks = function thunks() {};
exports.thunks2 = function() {};

// more or less the same as above
module.exports = function thing() {};
module.exports.horse = "morse";

// in this case we can mix `default` and the others
exports = module.exports = function() {};
exports.CONSTANT_NAME = 'HOUSE';
module.exports.isAnnoying = true;

// A common enough case that is a bit weird... will need to be two lines
var House = module.exports = function() {};

// this will be tricky and may require function hoisting...
exports.house('mouse');
module.exports.pork('bacon');

// don't do anything here
exports = 'a';
