/**
 * cjs - Replace require() calls with es6 imports statements
 */

 var sortBy = require('lodash/sortBy');
var util = require('../utils/main');

module.exports = function transformer(file, api, options) {
	var j = api.jscodeshift;
	var root = j(file.source);

	// require('a')
	root.find(j.ExpressionStatement, { expression: { callee: { name: 'require' }}})
		.forEach(function (expressionStatement) {
			if (!isParentRoot(expressionStatement)) return
			j(expressionStatement).replaceWith(convertRequire(expressionStatement, expressionStatement.node.comments));
		});

	root.find(j.VariableDeclaration).forEach(function(variableDeclaration) {
		// var ... = require('y')
		var defaultImports = j(variableDeclaration).find(j.VariableDeclarator, { init: { callee: { name: 'require' }}});

		// var ... = require('y').x
		var namedImports = j(variableDeclaration).find(j.VariableDeclarator, { init: { object: { callee: { name: 'require' }}}});

		var sortedImports = sortBy(
			defaultImports.paths().concat(namedImports.paths()),
			['value.loc.start.line', 'value.loc.start.column']
		);
		sortedImports.forEach(replaceDeclarator.bind(undefined, j))
  });

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
				});
		});

	// var x = require("y")( ... )
	root.find(j.VariableDeclarator, {
    init: {
      type: 'CallExpression',
      callee: {
        callee: {
          name: 'require'
        }
      }
    }
  }).filter(function(vdRef) {
    var callExpression = vdRef.value.init;
    return 'arguments' in callExpression && Array.isArray(callExpression.arguments);
  }).forEach(replaceCalledDeclarator.bind(undefined, j));

	return root.toSource(util.getRecastConfig(options));
}

function isParentRoot(path) {
  return path.parent.node.type === 'Program';
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

function replaceDeclarator (j, variableDeclarator, index) {
	var variableDeclaration = variableDeclarator.parent
	var variableDeclarationComments = Array.isArray(variableDeclaration.node.comments) ? variableDeclaration.node.comments : []
	if (!isParentRoot(variableDeclaration)) return

	// create unique variableDeclaration for each declarator (for more consistent prop extraction)
	var varStatement = j.variableDeclaration('var', [variableDeclarator.node]);
	var isLastDeclarator = variableDeclaration.node.declarations.length === 1
	var isFirstDeclarator = index === 0;
	var comments = variableDeclarationComments.filter(function(comment){
		return (isFirstDeclarator && comment.leading) || (isLastDeclarator && comment.trailing);
	})

	if (isLastDeclarator) {
		j(variableDeclaration).replaceWith(convertRequire(varStatement, comments));
	} else {
		// HACK: Using before for now, to avoid it mangling the whitespace after the var statement.
		// This will cause problems if the single var statement contains deps that the other els depend on
		j(variableDeclaration).insertBefore(convertRequire(varStatement, comments));
		j(variableDeclarator).remove();
	}
}

function replaceCalledDeclarator(j, variableDeclarator) {
	var id = variableDeclarator.value.id
	var factoryName;
	if (id.type === 'Identifier') {
		factoryName = id.name + 'Factory';
	} else if (id.type === 'ObjectPattern') {
		factoryName = id.properties.map(function(property){ return property.key.name }).join('') + 'Factory';
	}
	var calledArgs = variableDeclarator.value.init.arguments;
	var importSource = variableDeclarator.value.init.callee.arguments[0].value;
	var newImport = util.createImportStatement(importSource, factoryName);
	var newDeclaration = createCalledDeclaration(j, id, factoryName, calledArgs)
	variableDeclarator.parent.insertBefore(newImport, newDeclaration);

	if (variableDeclarator.parent.value.declarations.length === 1) {
		if ('comments' in variableDeclarator.parent.value) {
			newImport.comments = variableDeclarator.parent.value.comments;
		}
		j(variableDeclarator.parent).remove();
	} else {
		if ('comments' in variableDeclarator.value) {
			newImport.comments = variableDeclarator.value.comments;
		}
		j(variableDeclarator).remove();
	}
}

function createCalledDeclaration(j, id, callee, args) {
	return j.variableDeclaration('const', [j.variableDeclarator(
		id,
		j.callExpression(
			j.identifier(callee),
			args
		)
	)]);
}
