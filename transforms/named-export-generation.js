/**
 * named-export-generation - Given a default export object, generate named exports
 * corresponding to object properties.
 */

var util = require('../utils/main');

module.exports = function(file, api, options) {
	var j = api.jscodeshift;
	var root = j(file.source);
	var firstNode = root.find(j.Program).get('body', 0).node

	/**
	 * Add named exports for default exported declaration
	 */
	function addNamedExports(exportRef) {
		var defaultExportName;
		var objectExpressions = [];

		// Find default exported object expression
		// ex. export default { ... };
		if (exportRef.value.declaration.type === 'ObjectExpression') {
			defaultExportName = generateDefaultExportName()
			var replacementExport = j.exportDefaultDeclaration(j.identifier(defaultExportName));
			var replacementDeclaration = j.variableDeclaration('const', [
				j.variableDeclarator(j.identifier(defaultExportName), exportRef.value.declaration)
			]);
			if (exportRef.value.comments && exportRef.value.comments.length > 0) {
				replacementDeclaration.comments = exportRef.value.comments;
			}
			exportRef.insertBefore(replacementDeclaration);
			exportRef = j(exportRef).replaceWith(replacementExport).__paths[0];
		} else {
			defaultExportName = exportRef.value.declaration.name
		}


		// Find default exported declaration
		// ex. const analytics = { ... };
		//     export default analytics;
		root.find(j.VariableDeclarator, {
			id: {
				type: 'Identifier',
				name: defaultExportName
			},
			init: {
				type: 'ObjectExpression'
			}
		}).forEach(function(vdRef) {
			var objectExpression = vdRef.value.init;
			if (objectExpression !== null) {
				objectExpressions.push(objectExpression);
			}
		});

		// Find default exported VariableDeclarator modified by ExpressionStatement
		// ex. let analytics = { ... };      // Initialized
		//     analytics = { ... };          // Updated to different value
		//     analytics.someKey = 'horse';  // Updated to different value
		//     export default analytics;
		var mutatedProps = {};
		root.find(j.ExpressionStatement, {
			expression: {
				operator: '=',
				left: {
					name: defaultExportName,
					type: 'Identifier'
				},
				right: {
					type: 'ObjectExpression'
				}
			}
		}).forEach(function(esRef) {
			var objectExpression = esRef.value.expression.right
			objectExpression.properties.forEach(function(prop) {
				mutatedProps[prop.key.name] = prop
			});
		});
		root.find(j.ExpressionStatement, {
			expression: {
				operator: '=',
				left: {
					object: {
						name: defaultExportName
					},
					type: 'MemberExpression'
				}
			}
		}).forEach(function(esRef) {
			var name = esRef.value.expression.left.property.name
			var prop = j.property('init', j.identifier(name), esRef.value.expression.right);
			mutatedProps[name] = prop;
		});
		if (Object.keys(mutatedProps).length > 0) {
			var newObjectExpression = j.objectExpression(
				Object.keys(mutatedProps).map(function(key) {
					return mutatedProps[key];
				})
			)
			objectExpressions.push(newObjectExpression);
		}

		var referenceProps = [];
		var literalProps = [];
		// Convert object expressions into named export declarations and insert into tree
		objectExpressions.filter(function(objectExpression) {
			return 'properties' in objectExpression && objectExpression.properties.length > 0;
		}).forEach(function(objectExpression) {
			referenceProps = objectExpression.properties.filter(function(prop) {
				return (
					'key' in prop && prop.key.type === 'Identifier' &&
					'value' in prop && prop.value.type === 'Identifier'
				);
			});

			literalProps = objectExpression.properties.filter(function(prop) {
				return (
					// Ignore computed property keys
					!prop.computed &&
					('key' in prop &&
						// Object keys can be identifier or string literals
						(prop.key.type === 'Identifier' || prop.key.type === 'Literal')) &&
					'value' in prop && prop.value.type !== 'Identifier'
				);
			});
		});

		var declaredNamedExportDeclaration = createDeclaredNamedExportDeclaration(exportRef, defaultExportName, literalProps);
		if (declaredNamedExportDeclaration !== null) {
			exportRef.insertAfter(declaredNamedExportDeclaration);
		}

		var specifiedNamedExportDeclaration = createSpecificedNamedExportDeclaration(exportRef, defaultExportName, referenceProps);
		if (specifiedNamedExportDeclaration !== null) {
			exportRef.insertAfter(specifiedNamedExportDeclaration);
		}
	}

	function generateDefaultExportName() {
		var prefix = 'exported';
		var index = 2;
		var name = prefix;
		while (root.find(j.Identifier, { name: name }).length > 0) {
			name = prefix + index;
			index++;
		}
		return name;
	}

	function createDeclaredNamedExportDeclaration(exportRef, defaultExportName, props) {
		if (props.length === 0) {
			return null;
		}

		var exportNames = props.map(function(prop) {
			return prop.key.type === 'Literal' ?
				prop.key.value :
				prop.key.name;
		});

		var properties = exportNames.filter(function(name) {
			return shouldCreateNamedExport(defaultExportName, name)
		}).map(function(name) {
			var prop = j.property('init', j.identifier(name), j.identifier(name));
			prop.shorthand = true;
			return prop;
		});
		var exportNamedDeclaration = j.exportNamedDeclaration(
			j.variableDeclaration('const', [
				j.variableDeclarator(
					j.objectPattern(properties),
					exportRef.value.declaration
				)
			])
		);
		return exportNamedDeclaration;
	}

	function createSpecificedNamedExportDeclaration(exportRef, defaultExportName, props) {
		if (props.length === 0) {
			return null;
		}

		var specifiers = props.filter(function(prop) {
			return shouldCreateNamedExport(defaultExportName, prop.key.name)
		}).map(function(prop) {
			return j.exportSpecifier(j.identifier(prop.value.name), j.identifier(prop.key.name));
		});
		var exportNamedDeclaration = j.exportNamedDeclaration(null, specifiers);
		return exportNamedDeclaration;
	}

	function shouldCreateNamedExport(defaultExportName, exportName) {
		var isAlreadyExportedInDeclaration = root.find(j.Property, {
			value: {
				name: exportName
			}
		}).filter(function(r) {
			return util.hasParentOfType(r, 'ExportNamedDeclaration');
		}).length > 0;

		var isAlreadyExported = root.find(j.VariableDeclarator, {
			id: { name: exportName },
			init: {
				object: { name: defaultExportName },
				property: { name: exportName }
			}
		}).filter(function (r) {
			return util.hasParentOfType(r, 'ExportNamedDeclaration');
		}).length > 0;

		var isAlreadyExportedAsSpecifier = root.find(j.ExportSpecifier, {
			exported: {
				name: exportName
			}
		}).length > 0;

		var shouldCreateExport = !(isAlreadyExported || isAlreadyExportedInDeclaration || isAlreadyExportedAsSpecifier);
		return shouldCreateExport;
	}

	root.find(j.ExportDefaultDeclaration).forEach(addNamedExports);

	// re-add comment to to the top if necessary
	var firstNode2 = root.find(j.Program).get('body', 0).node
	if (firstNode !== firstNode2) {
		firstNode2.comments = firstNode.leadingComments
	}

	return root.toSource(util.getRecastConfig(options));
};
