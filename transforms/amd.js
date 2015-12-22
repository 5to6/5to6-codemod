/**
 * Replace this line with the utils/main.js file
 */
var util = require('../utils/main');

/**
 * Will convert require() statements in a js file to es6 import statements
 */
module.exports = function(file, api) {
    var j = api.jscodeshift;
    var root = j(file.source);
    var leadingComment = root.find(j.Program).get('body', 0).node.leadingComments;

    // root.find(j.VariableDeclaration).at(0).remove();

    root
        .find(j.CallExpression, { callee: { name: 'define' } }) // find require() function calls
        .filter(function(p) { return p.parentPath.parentPath.name === 'body'; })
        .forEach(function(p) {

            // define(function() { });
            if (p.value.arguments.length === 1) {
                return j(p.parent).replaceWith(p.value.arguments[0].body.body);
            }

            // define(['a', 'b', 'c'], function(a, b, c) { });
            if (p.value.arguments.length === 2) {
                var props = p.value.arguments[0].elements;
                var comments = p.parent.value.comments || [];
                var importStatements = props.map(function(prop, i) {
                    var moduleName = prop.value;
                    var variableName = p.value.arguments[1].params[i] && p.value.arguments[1].params[i].name;
                    return util.createImportStatement(moduleName, variableName);
                });

                // add the body after the import statements
                Array.prototype.push.apply(importStatements, p.value.arguments[1].body.body);

                // add any comments at the top
                importStatements[0].comments = comments;

                // done
                return j(p.parent).replaceWith(importStatements);
            }

        });

        // re-add comment to to the top
        root.get().node.comments = leadingComment;

        // FIXME: make this a config to pass in?
        return root.toSource({ quote: 'single' });
};
