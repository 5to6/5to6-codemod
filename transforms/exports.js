/**
 * exports - Replace module.exports calls with es6 exports
 */

var util = require('../utils/main');

module.exports = function(file, api) {
	var j = api.jscodeshift;
	var root = j(file.source);
	var leadingComment = root.find(j.Program).get('body', 0).node.leadingComments;

	function exportsToExport(p) {
		var declator = j.variableDeclarator(j.identifier(p.value.left.property.name), p.value.right);
		var declaration;
		if (p.value.right.type === 'FunctionExpression') {
			declaration = p.value.right;
		} else {
			declaration = j.variableDeclaration('let', [declator]);
		}
		var exportDecl = j.exportDeclaration(false, declaration);
		console.log('module.exports.thing', util.toString(p), util.toString(exportDecl));
		j(p.parentPath).replaceWith(exportDecl);
	}

	function exportsToDefault(p) {
		var exportDecl = j.exportDeclaration(true, p.value.right);
		console.log('module.exports', util.toString(p), util.toString(exportDecl));
		j(p.parentPath).replaceWith(exportDecl);
	}

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
		console.log(util.toString(decl), '\n', util.toString(exportDecl));
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
	.forEach(function(p) {
		var declator = j.variableDeclarator(j.identifier(p.value.left.property.name), p.value.right);
		var declaration = j.variableDeclaration('let', [declator]);
		var exportDecl = j.exportDeclaration(false, declaration);
		console.log('export.thing', util.toString(p), util.toString(exportDecl));
		j(p.parentPath).replaceWith(exportDecl);
	});

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
	.forEach(function exportsToDefault(p) {
		var exportDecl = j.exportDeclaration(true, p.value.right.right);
		console.log('exports = module.exports', util.toString(p.value.right.right), util.toString(exportDecl));
		j(p.parentPath).replaceWith(exportDecl);
	});

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

	// re-add comment to to the top
	root.get().node.comments = leadingComment;

	// FIXME: make this a config to pass in?
	return root.toSource({ quote: 'single' });
};
