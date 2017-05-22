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
   * @param comments {obj} - Comments AST object
   * @return {obj} - An AST object.
   * TODO: Add destructuring use cases...
   */
  createImportStatement: function(moduleName, variableName, propName, comments) {
    var declaration, variable, idIdentifier, nameIdentifier;
    // console.log('variableName', variableName);
    // console.log('moduleName', moduleName);

    // if no variable name, return `import 'jquery'`
    if (!variableName) {
      declaration = j.importDeclaration([], j.literal(moduleName) );
      declaration.comments = comments
      return declaration;
    }

    // multiple variable names indicates a destructured import
    if (Array.isArray(variableName)) {
      var variableIds = variableName.map(function(v, i) {
        var prop = Array.isArray(propName) && propName[i] ? propName[i] : v
        return j.importSpecifier(j.identifier(v), j.identifier(prop));
      });

      declaration = j.importDeclaration(variableIds, j.literal(moduleName));
    } else {
      // else returns `import $ from 'jquery'`
      nameIdentifier = j.identifier(variableName); //import var name
      variable = j.importDefaultSpecifier(nameIdentifier);

      // if propName, use destructuring `import {pluck} from 'underscore'`
      if (propName && propName !== 'default') {
        idIdentifier = j.identifier(propName);
        variable = j.importSpecifier(idIdentifier, nameIdentifier); // if both are same, one is dropped...
      }

      declaration = j.importDeclaration([variable], j.literal(moduleName) );
    }

    declaration.comments = comments

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
        propName = [];

        declarator.id.properties.forEach(function(p) {
          modules.push(p.key.name);
          propName.push(p.value.name);
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
  },

  getValidRecastArgs: function () {
    return [
      'esprima',
      'inputSourceMap',
      'lineTerminator',
      'quote',
      'range',
      'reuseWhitespace',
      'sourceFileName',
      'sourceMapName',
      'sourceRoot',
      'tabWidth',
      'tolerant',
      'trailingComma',
      'useTabs',
      'wrapColumn'
    ];
  },

  isRecastArg: function(item) {
    return util.getValidRecastArgs().indexOf(item) >= 0;
  },

  getDefaultTransformConfig: function() {
    return {
    };
  },

  getDefaultRecastConfig: function() {
    return {
      quote: 'single'
    };
  },

  getConfig(options, defaultConfig, keyFilterFunction) {
    if (keyFilterFunction === undefined) {
      keyFilterFunction = function() { return true; };
    }
    var out = {};
    var keys1 = Object.keys(defaultConfig);
    for (var i = 0; i < keys1.length; i++) {
      var key1 = keys1[i];
      if (keyFilterFunction(key1)) {
        out[key1] = defaultConfig[key1];
      }
    }
    // WAT: typeof null === 'object' === true
    if (options !== null && typeof options === 'object' && !Array.isArray(options)) {
      var keys2 = Object.keys(options);
      for (var j = 0; j < keys2.length; j++) {
        var key2 = keys2[j];
        if (keyFilterFunction(key2)) {
          out[key2] = options[key2];
        }
      }
    }
    return out;
  },

  getTransformConfig: function(options) {
    return util.getConfig(options, util.getDefaultTransformConfig(), function(key) {
      return !util.isRecastArg(key);
    })
  },

  getRecastConfig: function(options) {
    return util.getConfig(options, util.getDefaultRecastConfig(), function(key) {
      return util.isRecastArg(key);
    })
  },

  findParentOfType: function(node, type) {
      // traverse up the tree until end, or you find a matching type
      while (node.parentPath) {
          node = node.parentPath;
          if (node.value.type === type) {
              return node;
          }
      }

      return false;
  },

  hasParentOfType: function(node, type) {
    return util.findParentOfType(node, type) !== false;
  }
};


// DO NOT COPY THIS
module.exports = util;

/****************************************
 * PRIVATE HELPERS
 ***************************************/
