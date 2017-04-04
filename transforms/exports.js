/**
 * exports - Replace module.exports calls with es6 exports
 */

var util = require('../utils/main');

module.exports = function(file, api, options) {
	var j = api.jscodeshift;
	var root = j(file.source);
	var firstNode = root.find(j.Program).get('body', 0).node

	/**
	 * Move `module.exports.thing()` to `thing()`
	 */
	function exportsCall(p) {
		var functionCall = j.callExpression(p.value.callee.property, p.value.arguments);
		// console.log(util.toString(p), '=>', util.toString(functionCall));
		functionCall.comments = p.comments;
		j(p).replaceWith(functionCall);
	}

	/**
	 * Must be run before exportsToExport
	 * ```
	 * module.exports.foo = foo
	 * module.exports.bar = bar
	 * exports.baz = baz
	 * to
	 * export { foo, bar, baz }
	 * ```
	 */
	function MultiExportsToExport (paths) {
		var specifiers = []
		var filteredPaths = paths.filter(function (p) {
			if (p.parentPath.parentPath.name !== 'body') return false

			var isModuleExport = p.get('left', 'object', 'object', 'name').value === 'module'
				&& p.get('left', 'object', 'property', 'name').value === 'exports'
			var isExport = p.get('left', 'object', 'name').value === 'exports'

			if (!isModuleExport && !isExport) return false

			return p.value.left.property.name === p.value.right.name;
		})
		filteredPaths.forEach(function (p, i) {
			// aggregate all specifiers
			specifiers.push(j.exportSpecifier(
				j.identifier(p.value.right.name),
				j.identifier(p.value.right.name)
			))

			// replace the last module.exports.*
			if (i === filteredPaths.length - 1) {
				j(p.parentPath).replaceWith(j.exportDeclaration(false, null, specifiers))
			} else {
				j(p.parentPath).remove()
			}
		})
	}

	/**
	 * Move `module.exports.thing` to `export const thing`
	 */
	function exportsToExport(p) {
		var declator = j.variableDeclarator(j.identifier(p.value.left.property.name), p.value.right);
		var declaration = j.variableDeclaration('const', [declator]);
		var exportDecl = j.exportDeclaration(false, declaration);
		// console.log('[module.]exports.thing', util.toString(p), util.toString(exportDecl));
		exportDecl.comments = p.parentPath.value.comments;
		j(p.parentPath).replaceWith(exportDecl);
	}

	/**
	 * Move exports = module.exports to export default
	 */
	function exportsAndModuleExportsToDefault(p) {
		var exportDecl = j.exportDeclaration(true, p.value.right.right);
		// console.log('exports = module.exports', util.toString(p.value.right.right), util.toString(exportDecl));
		exportDecl.comments = p.parentPath.value.comments;
		j(p.parentPath).replaceWith(exportDecl);
	}

	/**
	 * Move `module.exports` to `export default`
	 */
	function exportsToDefault(p) {
		var exportDecl = j.exportDeclaration(true, p.value.right);
		// console.log('module.exports', util.toString(p), util.toString(exportDecl));
		exportDecl.comments = p.parentPath.value.comments;
		j(p.parentPath).replaceWith(exportDecl);
	}

	// find module.exports.thing = thing...
	// find exports.thing = thing...
	MultiExportsToExport(root.find(j.AssignmentExpression, {
		operator: '=',
		left: {
			type: 'MemberExpression'
		},
		right: {
			type: 'Identifier'
		}
	}))

	// find module.exports.thing = something....
	root.find(j.AssignmentExpression, {
		operator: '=',
		left: {
			type: 'MemberExpression',
			object: {
				type: 'MemberExpression',
				object: {
					name: 'module'
				},
				property: { name: 'exports' }
			}
		}
	})
	.filter(function(p) { return p.parentPath.parentPath.name === 'body'; })
	.forEach(exportsToExport);

	// find var House = module.exports = something....
	root.find(j.AssignmentExpression, {
		operator: '=',
		left: {
			object: { name: 'module' },
			property: { name: 'exports' }
		}
	})
	.filter(function(p) {
		var isVar = p.parentPath.value.type === 'VariableDeclarator';
		var isOnBody = p.parentPath.parentPath.parentPath.parentPath.name === 'body';
		return isVar && isOnBody;
	})
	.forEach(function (p) {
		var decl = j.variableDeclarator(p.parentPath.value.id, p.value.right);
		var exportDecl = j.exportDeclaration(true, p.parentPath.value.id);
		// console.log(util.toString(decl), '\n', util.toString(exportDecl));
		j(p.parentPath).replaceWith(decl);
		j(p.parentPath.parentPath.parentPath).insertAfter(exportDecl);
	});

	// find module.exports = something....
	root.find(j.AssignmentExpression, {
		operator: '=',
		left: {
			object: { name: 'module' },
			property: { name: 'exports' }
		}
	})
	.filter(function(p) {
		return p.parentPath.parentPath.name === 'body';
	})
	.forEach(exportsToDefault);

	// find exports.thing = something....
	root.find(j.AssignmentExpression, {
		operator: '=',
		left: {
			object: { name: 'exports' }
		}
	})
	.filter(function(p) {
		return p.parentPath.parentPath.name === 'body';
	})
	.forEach(exportsToExport);

	// find exports = module.exports = something....
	root.find(j.AssignmentExpression, {
		operator: '=',
		left: {
			name: 'exports'
		},
		right: {
			type: 'AssignmentExpression',
			operator: '=',
			left: {
				type: 'MemberExpression',
				object: {
					name: 'module'
				},
				property: {
					name: 'exports'
				}
			}
		}
	})
	.filter(function(p) {
		return p.parentPath.parentPath.name === 'body';
	})
	.forEach(exportsAndModuleExportsToDefault);

	// find exports.house()
	root.find(j.CallExpression, {
		callee: {
			type: 'MemberExpression',
			object: { name: 'exports' }
		}
	})
	.forEach(exportsCall);

	// find module.exports.house()
	root.find(j.CallExpression, {
		callee: {
			type: 'MemberExpression',
			object: {
				type: 'MemberExpression',
				object: { name: 'module'},
				property: { name: 'exports' }
			}
		}
	})
	.forEach(exportsCall);

	// find var House = module.exports something....
	root.find(j.AssignmentExpression, {
		operator: '=',
		left: {
			type: 'MemberExpression',
			object: {
				type: 'MemberExpression',
				object: {
					name: 'module'
				},
				property: { name: 'exports' }
			}
		}
	})
	.filter(function(p) { return p.parentPath.parentPath.name === 'body'; })
	.forEach(exportsToExport);

	// re-add comment to to the top if necessary
	var firstNode2 = root.find(j.Program).get('body', 0).node
	if (firstNode !== firstNode2) {
		firstNode2.comments = firstNode.leadingComments
	}

	return root.toSource(util.getRecastConfig(options));
};
