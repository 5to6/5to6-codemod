var util = require('../utils/main');


// LEARN FROM THIS ONE https://github.com/cpojer/js-codemod
/**
 * This replaces every occurence of variable "foo".
 */
module.exports = function(fileInfo, api) {
    var j = api.jscodeshift;

    return j(fileInfo.source)
    // .findVariableDeclarators('foo')
    .find(j.CallExpression, {callee: {name: 'require'}}) // find require() function calls
    .replaceWith(function(p) {

        // is this require() part of a var declaration?
        // var $ = require('jquery');
        var varParent = findVarParent(p);

        if (varParent) {
            var props = util.getPropsFromRequire(varParent);
            var importStatement = util.createImportStatement(props.moduleName, props.variableName);

           // reach higher in the tree to replace the var statement with an import. Needed so we don't just
           // replace require() with the import statement.
           return j(varParent).replaceWith(importStatement);

        }

        // not part of a var statment
        // require('underscore');
        var props = util.getPropsFromRequire(p.parent); // use.p.parent so it includes the semicolon
        var importStatement = util.createImportStatement(props.moduleName, props.variableName);

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
