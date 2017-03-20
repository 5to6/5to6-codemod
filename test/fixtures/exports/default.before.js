// should be export default
module.exports = { a: 'a' };

// A common enough case that is a bit weird... will need to be two lines
var House = module.exports = function() {};
