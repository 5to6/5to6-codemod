// should be export default
// should be export default
export default { a: 'a' };

// should be `export let things`
export let things = "a";

// should be `export function thunks1`
export function thunks1() {};

// should be `export function thunks2`
export function thunks2() {};

// should be `export function thunks3`
export function thunks3() {};

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