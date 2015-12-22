/**
 * Top of the mornin' to ya
 */
define(function() {
	console.log('a');
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
});

define(['a', 'b', 'c'], function(moduleA, moduleB, moduleC) {
	console.log('123');
});

define(['a', 'b', 'c', 'd'], function(moduleA, moduleB, moduleC) {
	console.log('xyz');
});

