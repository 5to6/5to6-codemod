// should be export default
module.exports = { a: 'a' };

// should be `export let things`
exports.things = "a";
// should be `export function thunks1`
exports.thunks1 = function thunks1() {};
// should be `export function thunks2`
exports.thunks2 = function() {};
// should be `export function thunks3`
exports.thunks3 = function thunkName() {};

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

