// module.exports.thing = something....

// should be `export const` or `export function`
exports.things = "a";
exports.thunks = function thunks() {};
exports.thunks2 = function() {};

module.exports.horse = "morse";

function foo () {}
module.exports.foo = foo;
function bar () {}
module.exports.bar = bar;
function world () {}
module.exports.hello = world;
