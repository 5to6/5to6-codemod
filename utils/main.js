// http://skookum.com/blog/converting-a-project-from-amd-to-cjs-with-recast

var j = require('jscodeshift');
var recast = require('recast');

var util = {
  // wraps each VariableDeclarator in a VariableDeclaration so it includes the 'var' and semicolon
  // unrollSingleVar
  //
  /**
   * Returns an array of var declarations
   *
   */
  singleVarToExpressions: function(ast) {
    // if ast.value, use that... Sometimes you need that to access the node that we care about directly.
    ast = ast.value || ast;

    var expressions = [];
    var declarations = ast.declarations;
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
      console.warn('ERROR: Expected a single var statement. THat\'s NOT what I got:');
      console.log('ast', ast);
    }
  },

  /**
   * Pass in params, creates and returns import statement AST
   * @param moduleName {string} - Also called the source
   * @param variableName {string} - Also called a specifier
   * @param propName {string} - `b` in `require('a').b`
   * @return {obj} - An AST object.
   * TODO: Add destructuring use cases...
   */
  createImportStatement: function(moduleName, variableName, propName) {
    var declaration, variable, idIdentifier, nameIdentifier;
    // console.log('variableName', variableName);
    // console.log('moduleName', moduleName);

    // if no variable name, return `import 'jquery'`
    if (!variableName) {
      declaration = j.importDeclaration([], j.literal(moduleName) );
      return declaration;
    }

    // multiple variable names indicates a destructured import
    if (Array.isArray(variableName)) {
      var variableIds = variableName.map(function(v) {
        return j.importSpecifier(j.identifier(v), j.identifier(v));
      });

      declaration = j.importDeclaration(variableIds, j.literal(moduleName));
    } else {
      // else returns `import $ from 'jquery'`
      nameIdentifier = j.identifier(variableName); //import var name
      variable = j.importDefaultSpecifier(nameIdentifier);

      // if propName, use destructuring `import {pluck} from 'underscore'`
      if (propName) {
        idIdentifier = j.identifier(propName);
        variable = j.importSpecifier(idIdentifier, nameIdentifier); // if both are same, one is dropped...
      }

      declaration = j.importDeclaration([variable], j.literal(moduleName) );
    }

    return declaration;
  },

  /**
   * Converts the AST obj/tree and turns it into readable code.
   * Returns a string.
   */
  toString: function(ast) {
    // force single quotes in the output...
    return recast.print(ast, { quote: 'single' }).code;
  },


  /**
   * Pass in a require statement, returns the important parts.
   * @param ast {VariableDeclaration|ExpressionStatement} - Not the full AST.
   */
  getPropsFromRequire: function(ast) {
    var variableName, moduleName, propName;
    var declarator;
    // safety checks
    // if ast.value, use that... Sometimes you need that to access the node that we care about directly.
    ast = ast.value || ast;

    // require('jquery');
    if (ast.type === 'ExpressionStatement') {
      moduleName = ast.expression.arguments[0].value;

    // `var prop = require('jquery').prop;`
    } else if (ast.type === 'VariableDeclaration' && ast.declarations[0].init.type === 'MemberExpression') {
      declarator = ast.declarations[0];
      propName = declarator.init.property.name;
      moduleName = declarator.init.object.arguments[0].value;
      variableName = declarator.id.name;

    // var $ = require('jquery');  and check that it isn't a single var statement
    } else if (ast.type === 'VariableDeclaration' && ast.declarations.length === 1) {


      // get the var declaration
      declarator = ast.declarations[0];

      if (!declarator.init.arguments) {
        console.log('getPropsFromRequire: wrong type: ', declarator);
      }

      moduleName = declarator.init.arguments[0].value;
      variableName = declarator.id.name;

      // var $ = require('jquery');

      if (declarator.id.type === 'Identifier') {
        variableName = declarator.id.name;

      // var { includes, pick } = require('lodash');
      } else if (declarator.id.type === 'ObjectPattern') {
        var modules = [];

        declarator.id.properties.forEach(function(p) {
          modules.push(p.key.name);
        });

        variableName = modules;
      }

    } else {
      // console.log('ELSE');
      // moduleName = ast.arguments[0].value;
    }

    var obj = {
      moduleName: moduleName
    };

    // these are set sometimes
    if (propName) {
      obj.propName = propName;
    }
    if (variableName) {
      obj.variableName = variableName;
    }

    return obj;
  }

};


// DO NOT COPY THIS
module.exports = util;

/****************************************
 * PRIVATE HELPERS
 ***************************************/
