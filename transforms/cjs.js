/**
 * cjs - Replace require() calls with es6 imports statements
 */

var util = require('../utils/main');

module.exports = function(file, api) {
    var j = api.jscodeshift;
    var root = j(file.source);
    var originalLeadingComment = root.find(j.Program).get('body', 0).node.leadingComments;

    // migrate away all the imports
    root.find(j.CallExpression, { callee: { name: 'require' } }) // find require() function calls
        .filter(function(p) {
          return p.parent.node.type !== 'CallExpression';
        })
        .forEach(function(p) {

            var props, importStatement;

            // is this require() part of a var declaration?
            // var $ = require('jquery');
            var varParent = findVarParent(p);

            // am I part of a single var statement?
            if (varParent && isSingleVar(varParent)) {
                // wrap the variableDeclarator in a VariableDeclaration (for more consistent prop extraction)
                var varStatement = j.variableDeclaration('var', [p.parentPath.value]);
                props = util.getPropsFromRequire(varStatement);

                importStatement = util.createImportStatement(props.moduleName, props.variableName, props.propName);

                // insert the new import statement AFTER the singleVar and and remove the require() from the single var.
                //j(varParent).insertAfter(importStatement);
                // HACK: Using before for now, to avoid it mangling the whitespace after the var statement.
                // This will cause problems if the single var statement contains deps that the other els depend on
                j(p.parentPath.parent).insertBefore(importStatement);
                j(p.parent).remove();

                return;

            } else if (varParent) {
                props = util.getPropsFromRequire(varParent);
                importStatement = util.createImportStatement(props.moduleName, props.variableName, props.propName);

                // reach higher in the tree to replace the var statement with an import. Needed so we don't just
                // replace require() with the import statement.
                j(varParent).replaceWith(importStatement);
                return;

            }

            // require ('es6-promise').polyfill();
            if (p.parent.value.type === 'MemberExpression') {
                return
            }

            // not part of a var statment
            // require('underscore');
            props = util.getPropsFromRequire(p.parent); // use.p.parent so it includes the semicolon
            importStatement = util.createImportStatement(props.moduleName, props.variableName, props.propName);

            j(p.parent).replaceWith(importStatement);
            return;
        });

    // re-add comment to to the top
    var currentLeadingComment = root.find(j.Program).get('body', 0).node.leadingComments;
    if (!currentLeadingComment && originalLeadingComment) {
        root.get().node.comments = originalLeadingComment;
    }

    return root.toSource({ quote: 'single' });
};


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
    while(node.parentPath) {
        node = node.parentPath;
        //console.log('node', node)

        if (node.value.type === 'VariableDeclaration') {
            //console.log('decs', node.value.declarations.length);
            // console.log('singleVarValue', node);
            return node;
        }
    }

    return false;
}
