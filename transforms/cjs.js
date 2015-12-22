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
    .find(j.CallExpression, {callee: {name: 'require'}}) // find require() function calls
    .forEach(function(p) {

        // is this require() part of a var declaration?
        // var $ = require('jquery');
        var varParent = findVarParent(p);

        // am I part of a single var statement?
        if (varParent && isSingleVar(varParent)) {
            // wrap the variableDeclarator in a VariableDeclaration (for more consistent prop extraction)
            var varStatement = j.variableDeclaration('var', [p.parentPath.value]);
            var props = util.getPropsFromRequire(varStatement);

            var importStatement = util.createImportStatement(props.moduleName, props.variableName, props.propName);

            // insert the new import statement AFTER the singleVar and and remove the require() from the single var.
            //j(varParent).insertAfter(importStatement);
            // HACK: Using before for now, to avoid it mangling the whitespace after the var statement.
            // This will cause problems if the single var statement contains deps that the other els depend on
            j(p.parentPath.parent).insertBefore(importStatement);
            j(p.parent).remove();

            return;

        } else if (varParent) {
            var props = util.getPropsFromRequire(varParent);
            var importStatement = util.createImportStatement(props.moduleName, props.variableName, props.propName);

            // reach higher in the tree to replace the var statement with an import. Needed so we don't just
            // replace require() with the import statement.
            return j(varParent).replaceWith(importStatement);

        }

        // not part of a var statment
        // require('underscore');
        var props = util.getPropsFromRequire(p.parent); // use.p.parent so it includes the semicolon
        var importStatement = util.createImportStatement(props.moduleName, props.variableName, props.propName);

        return j(p.parent).replaceWith(importStatement);

    })
    // FIXME: make this a config to pass in?
    .toSource({quote: 'single'});
}


/**
 * LOCAL HELPERS
 *
 */
// helpers... TODO: Decide if these should go in the main helpers or just here...

/**
 * @param node {VariableDeclaration} - Expecting to see the parent node.
 *
 */
function isSingleVar(node) {
    return (node.value.declarations.length > 1);
}

/**
 * Traverse up the tree until you find the top, or the var statement that's the parent
 * of the node you're passing in.
 * Needed for single var statments especially
 *
 */
function findVarParent(node) {
    // traverse up the tree until end, or you find var declaration
    while(node.parentPath){
        node = node.parentPath;
        //console.log('node', node)

        if (node.value.type === "VariableDeclaration"){
            //console.log('decs', node.value.declarations.length);
            // console.log('singleVarValue', node);
            return node;
        };
    }

    return false;
}
