// should be export default
export default { a: 'a' };

// should be `export let` or `export function`
export let things = "a";
export function thunks() {};

// more or less the same as above
export default function thing() {};
export let horse = "morse";

// in this case we can mix `default` and the others
export default function() {};
export let CONSTANT_NAME = 'HOUSE';
export let isAnnoying = true;

// A common enough case that is a bit weird... will need to be two lines
var House = function() {};
export default House;

// this will be tricky and may require function hoisting...
house('mouse');
pork('bacon');

// don't do anything here
exports = 'a';