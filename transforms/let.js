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

	// remove all "use strict" statements
	root.find(j.VariableDeclaration, { kind: 'var' }).forEach(function(p) {
		var letStatement = j.variableDeclaration('let', p.value.declarations);
		console.log('let:', util.toString(p));
		letStatement.comments = p.value.comments;
		return j(p).replaceWith(letStatement);
	});

	return root.toSource({ quote: 'single' });
};
