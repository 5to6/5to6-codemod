define(function() {
	console.log('a');
});

define([], function() {
	console.log('a');
});

define(['a'], function() {
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

