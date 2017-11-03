/**
 * amd - Replace define([]) calls with es6 import/exports
 */

const util = require('../utils/main');

module.exports = function(file, api, options) {
    const j = api.jscodeshift;
    const root = j(file.source);
    const leadingComment = root.find(j.Program).get('body', 0).node.leadingComments;

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

            // define(function() { });
            if (p.value.arguments.length === 1) {

                // convert `return` statement to `export default`
                let body = returnToExport(p.value.arguments[0].body.body);

                let comments = p.parent.value.comments || [];

                // replace any var x = require('x') with import x from 'x';
                let importStatements = [];
                body.filter(path => path.type === 'VariableDeclaration')
                    .forEach(path => {
                        path.declarations.forEach((d, i) => {
                            if (d.init
                                    && d.init.type === 'CallExpression'
                                    && d.init.callee.name === 'require') {
                                path.declarations.splice(i, 1);
                                var moduleName = d.init.arguments[0].value;
                                var variableName = d.id.name;
                                importStatements.push(util.createImportStatement(moduleName, variableName));
                            }
                        });
                    });

                // remove any variable declarations which are now empty
                body = body.filter(path => {
                    if (path.type !== 'VariableDeclaration') {
                        return true;
                    }
                    return path.declarations.length !== 0;
                });

                // add the body after the import statements
                Array.prototype.push.apply(importStatements, body);

                // add any comments at the top
                importStatements[0].comments = util.filterRedundantComments(leadingComment, comments);

                return j(p.parent).replaceWith(importStatements);
            }

            // define(['a', 'b', 'c'], function(a, b, c) { });
            if (p.value.arguments.length === 2) {
                let props = p.value.arguments[0].elements;
                let comments = p.parent.value.comments || [];
                let importStatements = props.map(function(prop, i) {
                    let moduleName = prop.value;
                    let variableName = p.value.arguments[1].params[i] && p.value.arguments[1].params[i].name;
                    return util.createImportStatement(moduleName, variableName);
                });

                // add the body after the import statements
                Array.prototype.push.apply(importStatements, p.value.arguments[1].body.body);

                // add any comments at the top
                console.log(comments.value);
                importStatements[0].comments = util.filterRedundantComments(leadingComment, comments);

                // done
                return j(p.parent).replaceWith(returnToExport(importStatements));
            }
        });

        // re-add comment to to the top
        root.get().node.comments = leadingComment;

        return root.toSource(util.getRecastConfig(options));
};
