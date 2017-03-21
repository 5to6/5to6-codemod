/**
 * no-strict - Remove "use strict" statements from files.
 */

var util = require('../utils/main');

/**
 * Will convert require() statements in a js file to es6 import statements
 */
module.exports = function(file, api, options) {
	var j = api.jscodeshift;
	var root = j(file.source);
	var leadingComment = root.find(j.Program).get('body', 0).node.leadingComments;
	var replaceLeadingComment = false;

	// remove all "use strict" statements
	root.find(j.ExpressionStatement).forEach(function(item) {
		if (item.value.expression.value === 'use strict') {
			replaceLeadingComment = replaceLeadingComment || item.parent.value.type === 'Program';
			j(item).remove();
		}
	});

	// re-add comment to to the top if it was removed
	if (replaceLeadingComment) {
		root.get().node.comments = leadingComment;
	}

	return root.toSource(util.getRecastConfig(options));
};
