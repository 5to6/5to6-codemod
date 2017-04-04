// module.exports.thing = something....

// should be `export const` or `export function`
export const things = "a";

export const thunks = function thunks() {};
export const thunks2 = function() {};
export const horse = "morse";

function foo () {}
function bar () {}
export { foo, bar, world };
function world () {}
export const hello = world;
