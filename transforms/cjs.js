/**
 * cjs - Replace require() calls with es6 imports statements
 */

var util = require('../utils/main');

module.exports = function transformer(file, api, options) {
	var config = util.getConfig(options);
	var j = api.jscodeshift;
	var root = j(file.source);

	// require('a')
	root.find(j.ExpressionStatement, { expression: { callee: { name: 'require' }}})
		.forEach(function (expressionStatement) {
			if (!isParentRoot(expressionStatement)) return
			j(expressionStatement).replaceWith(convertRequire(expressionStatement, expressionStatement.node.comments));
		})

	// var ... = require('y')
	root.find(j.VariableDeclarator, { init: { callee: { name: 'require' }}})
		.forEach(replaceDeclarator.bind(undefined, j))

	// var ... = require('y').x
	root.find(j.VariableDeclarator, { init: { object: { callee: { name: 'require' }}}})
		.forEach(replaceDeclarator.bind(undefined, j))

	// var x = { x: require('...'), y: require('...'), ... }
	root.find(j.VariableDeclaration, { declarations: [{ init: { type: 'ObjectExpression' }}] })
		.forEach(function (variableDeclaration) {
			if (!isParentRoot(variableDeclaration)) return

			// only look at properties with require('...')
			j(variableDeclaration)
				.find(j.Property, { value: { callee: { name: 'require' }}})
				.forEach(function (property) {
					// generate import statement
					var variableName = property.get('key', 'name').value
					var moduleName = property.get('value', 'arguments', 0, 'value').value
					var importStatement = util.createImportStatement(moduleName, variableName, undefined, property.node.comments)

					// modify property
					var newProp = api.jscodeshift.property(property.node.kind, property.node.key, property.node.key)
					newProp.shorthand = true

					j(variableDeclaration).insertBefore(importStatement)
					j(property).replaceWith(newProp)
				})
		})

	return root.toSource(config);
}

function isParentRoot(path) {
  return path.parent.node.type === 'Program'
}

function convertRequire (ast, comments) {
	var props = util.getPropsFromRequire(ast);
	return util.createImportStatement(
		props.moduleName,
		props.variableName,
		props.propName,
		comments
	);
}

function replaceDeclarator (j, variableDeclarator) {
	var variableDeclaration = variableDeclarator.parent
	if (!isParentRoot(variableDeclaration)) return

	// create unique variableDeclaration for each declarator (for more consistent prop extraction)
	var varStatement = j.variableDeclaration('var', [variableDeclarator.node]);
	var isSingleDeclarator = variableDeclaration.node.declarations.length === 1

	if (isSingleDeclarator) {
		j(variableDeclaration).replaceWith(convertRequire(varStatement, variableDeclaration.node.comments))
	} else {
		// HACK: Using before for now, to avoid it mangling the whitespace after the var statement.
		// This will cause problems if the single var statement contains deps that the other els depend on
		j(variableDeclaration).insertBefore(convertRequire(varStatement));
		j(variableDeclarator).remove();
	}
}
