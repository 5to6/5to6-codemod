// should be export default
export default { a: 'a' };

// should be `export const` or `export function`
export const things = "a";

export const thunks = function thunks() {};
export const thunks2 = function() {};

// more or less the same as above
export default function thing() {};

export const horse = "morse";

// in this case we can mix `default` and the others
export default function() {};

export const CONSTANT_NAME = 'HOUSE';
export const isAnnoying = true;

// A common enough case that is a bit weird... will need to be two lines
var House = function() {};

export default House;

// this will be tricky and may require function hoisting...
house('mouse');
pork('bacon');

// don't do anything here
exports = 'a';
