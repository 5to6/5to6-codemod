/**
 * Top of the mornin' to ya
 */
define(function() {
	console.log('a');
});

define(function() {
	return {};
});

define(function() {
	return {};
	console.log('last statement');
});

/**
 * Hunger Games is real
 */

define([], function() {
	console.log('b');
});

// line comment a
define(['a'], function() {
	// line comment b
	console.log('dont bother with a');
});

define(['a'], function(a) {
	console.log('I need you A', a.isUsed());
	return a.b;
});

define(['a', 'b', 'c'], function(moduleA, moduleB, moduleC) {
	console.log('123');
});

define(['a', 'b', 'c', 'd'], function(moduleA, moduleB, moduleC) {
	console.log('xyz');
});

define(() => {
	console.log('c');
});

define(() => {
	return {};
});

define(() => {
  return {};
  console.log('last statement');
});

define([], () => {
	console.log('d');
});

define(['d'], () => {
	console.log('dont bother with d');
});

define(['d'], (d) => {
  console.log('I need you D', d.isUsed());
  return d.e;
});

define([], () => ({
	e: '123'
}));

define(['e'], () => ({
	e: 'e is ignored'
}));

define(['e'], (e) => ({
	e: `e is ${e.isUsed()}`
}));

define(() => ({
	f: '123'
}));
