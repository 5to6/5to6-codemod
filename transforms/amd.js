/**
 * amd - Replace define([]) calls with es6 import/exports
 */

var util = require('../utils/main');

module.exports = function(file, api, options) {
    var j = api.jscodeshift;
    var root = j(file.source);
    var leadingComment = root.find(j.Program).get('body', 0).node.leadingComments;

    /**
     * Convert an `return` to `export default`.
     * @param body - Function body AST (Array)
     */
    function returnToExport(body) {
        var exportStatement;
        var possibleReturn = body.filter(function (node) {
            return node.type === 'ReturnStatement'
        }).reduce(function (prev, cur) {
            return cur;
        }, null);

        if (possibleReturn && body.indexOf(possibleReturn) != -1) {
            exportStatement = j.exportDeclaration(true, possibleReturn.argument);
            body[body.indexOf(possibleReturn)] = exportStatement;
        }
        return body;
    }

    root
        .find(j.CallExpression, { callee: { name: 'define' } }) // find require() function calls
        .filter(function(p) { return p.parentPath.parentPath.name === 'body'; })
        .forEach(function(p) {

            var body;

            // define(function() { });
            if (p.value.arguments.length === 1) {

                // convert `return` statement to `export default`
                body = returnToExport(p.value.arguments[0].body.body);

                return j(p.parent).replaceWith(body);
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
                return j(p.parent).replaceWith(returnToExport(importStatements));
            }

        });

        // re-add comment to to the top
        root.get().node.comments = leadingComment;

        return root.toSource(util.getRecastConfig(options));
};
