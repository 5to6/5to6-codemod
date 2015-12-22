/**
 * Replace this line with the utils/main.js file
 */
var util = require('../utils/main');

/**
 * Will convert require() statements in a js file to es6 import statements
 */
module.exports = function(fileInfo, api) {
    var j = api.jscodeshift;


    return j(fileInfo.source)
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
            var importStatements = props.map(function(prop, i) {
                var moduleName = prop.value;
                var variableName = p.value.arguments[1].params[i] && p.value.arguments[1].params[i].name;
                return util.createImportStatement(moduleName, variableName);
            });
            Array.prototype.push.apply(importStatements, p.value.arguments[1].body.body);
            return j(p.parent).replaceWith(importStatements);
        }

    })
    // FIXME: make this a config to pass in?
    .toSource({ quote: 'single' });
};
