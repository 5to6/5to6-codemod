/**
 * HELPERS. Here for now. Prolly move to utils soon.
 */
// http://skookum.com/blog/converting-a-project-from-amd-to-cjs-with-recast

var j = require('jscodeshift');

module.exports = {
  // wraps each VariableDeclarator in a VariableDeclaration so it includes the 'var' and semicolon
  // unrollSingleVar
  //
  /**
   * Returns an array of var declarations
   *
   */
  singleVarToExpressions: function(ast) {

    var expressions = [];
    declarations = ast.declarations;
    // safety checks
    // am I a single var statement?
    if (ast.type === 'VariableDeclaration' && ast.declarations.length > 1) {
      for (var i = 0; i < declarations.length; i++) {
        var varStatement = j.variableDeclaration('var', [ast.declarations[i]]);
        expressions.push(varStatement);
      }

      // console.log('expressions', expressions);
      return expressions;
      // console.log('inside');
      // console.log('varStatement', varStatement);
    } else {
      console.warn('ERROR: Expected a single var statement. THat\'s NOT what I got');
    }
  },

  /**
   * Pass in params, creates and returns import statement AST
   * @param moduleName {string} - Also called the source
   * @param variableName {string} - Also called a specifier
   * @return {obj} - An AST object.
   * TODO: Add destructuring use cases...
   */
  createImportStatement: function(moduleName, variableName) {
    // console.log('variableName', variableName);
    // console.log('moduleName', moduleName);

    // if no variable name, return `import 'jquery'`
    if (!variableName) {
      var declaration = j.importDeclaration([], j.literal(moduleName) );
    } else {
      // else returns `import $ from 'jquery'`
      var identifier = j.identifier(variableName); //import var name
      var variable = j.importDefaultSpecifier(identifier);
      var declaration = j.importDeclaration([variable], j.literal(moduleName) );
    }

    return declaration;

  },

  /**
   * Pass in a require statement, returns the important parts.
   * @param ast {obj} - Of type VariableDeclaration. Not the full AST.
   */
  getPropsFromRequire: function(ast) {
    var variableName, moduleName;
    // safety checks
    // if ast.value, use that... Sometimes you need that to access the node that we care about directly.
    ast = ast.value || ast;

    // require('jquery');
    if (ast.type === 'ExpressionStatement') {
      moduleName = ast.expression.arguments[0].value;
    // var $ = require('jquery');  and check that it isn't a single var statement
    } else if (ast.type === 'VariableDeclaration' && ast.declarations.length === 1) {
      // get the var declaration
      var declaration = ast.declarations[0];

      moduleName = declaration.init.arguments[0].value;
      variableName = declaration.id.name;

    } else {
      // console.log('ELSE');
      // moduleName = ast.arguments[0].value;
    }


    return {
      variableName: variableName,
      moduleName: moduleName
    }

  }

}


/****************************************
 * PRIVATE HELPERS
 ***************************************/
