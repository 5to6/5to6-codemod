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
exports.world = world
function world () {}
module.exports.hello = world;
