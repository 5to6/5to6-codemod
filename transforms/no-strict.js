/**
 * Replace this line with the utils/main.js file
 */
// var util = require('../utils/main');

/**
 * Will convert require() statements in a js file to es6 import statements
 */
module.exports = function(file, api) {
	var j = api.jscodeshift;
	var root = j(file.source);
	var leadingComment = root.find(j.Program).get('body', 0).node.leadingComments;

	// remove all "use strict" statements
	root.find(j.ExpressionStatement).forEach(function(item) {
		if (item.value.expression.value === 'use strict') {
			j(item).remove();
		}
	});

	// re-add comment to to the top
	root.get().node.comments = leadingComment;

	// FIXME: make this a config to pass in?
	return root.toSource({ quote: 'single' });
};
