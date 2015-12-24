/**
 * let - Convert `var` statements to `let`
 */

var util = require('../utils/main');

/**
 * Will convert var statements to let
 */
module.exports = function(file, api) {
	var j = api.jscodeshift;
	var root = j(file.source);
	var leadingComment = root.find(j.Program).get('body', 0).node.leadingComments;

	// remove all "use strict" statements
	root.find(j.VariableDeclaration, { kind: 'var' }).forEach(function(p) {
		var letStatement = j.variableDeclaration('let', p.value.declarations);
		console.log('let', util.toString(p));
		return j(p).replaceWith(letStatement);
	});

	// re-add comment to to the top
	root.get().node.comments = leadingComment;

	return root.toSource({ quote: 'single' });
};
