/**
 * exports - Replace module.exports calls with es6 exports
 */

var util = require('../utils/main');

module.exports = function(file, api) {
	var j = api.jscodeshift;
	var root = j(file.source);
	var leadingComment = root.find(j.Program).get('body', 0).node.leadingComments;

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
	.forEach(function(p) {
		var declator = j.variableDeclarator(j.identifier(p.value.left.property.name), p.value.right);
		var declaration = j.variableDeclaration('let', [declator]);
		var exportDecl = j.exportDeclaration(false, declaration);
		console.log('module.exports.thing', util.toString(p), util.toString(exportDecl));
		j(p.parentPath).replaceWith(exportDecl);
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
	.forEach(function(p) {
		var exportDecl = j.exportDeclaration(true, p.value.right);
		console.log('module.exports', util.toString(p), util.toString(exportDecl));
		j(p.parentPath).replaceWith(exportDecl);
	});

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

	// re-add comment to to the top
	root.get().node.comments = leadingComment;

	// FIXME: make this a config to pass in?
	return root.toSource({ quote: 'single' });
};
