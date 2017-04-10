// TODO: See if we should decouple the actual rule well enough that it can be run from both the command line and the
// node interface (test)
/**
 * DEPS
 */
var recast = require('recast');
var assert = require('assert');
var assign = require('lodash/assign');

/**
 * LOCAL DEPS
 */
var utils = require('../utils/main');

/**
 * TESTS
 *
 */

describe('util.getPropsFromRequire(ast)', function(){

  it('require(\'something\') -> {moduleName: \'something\'}', function() {
    var ast = toAST('require(\'underscore\');')[0]; // returns an array of statements
    var result = utils.getPropsFromRequire(ast);
    var expected = { moduleName: 'underscore' };
    assert.deepEqual(result, expected);
  });

  it('var _ = require(\'underscore\') -> {variableName = \'_\', moduleName: \'something\'}', function() {
    var ast = toAST('var _ = require(\'underscore\');')[0]; // returns an array of statements
    var result = utils.getPropsFromRequire(ast);
    var expected = { variableName: '_', moduleName: 'underscore' };

    assert.deepEqual(result, expected);

  });

  it('var fetch = require(\'underscore\').pluck -> {variableName = \'pluck\', moduleName: \'underscore\', prop: \'pluck\'}', function() {
    var ast = toAST('var fetch = require(\'underscore\').pluck;')[0]; // returns an array of statements
    var result = utils.getPropsFromRequire(ast);
    var expected = { variableName: 'fetch', moduleName: 'underscore', propName: 'pluck' };

    assert.deepEqual(result, expected);
  });


  it('var { includes, pick } = require(\'lodash\') -> {variableName: [\'includes\', \'pick\'], moduleName: \'lodash\' propName: [\'includes\', \'pick\']}', function() {
    var ast = toAST('var { includes, pick } = require(\'lodash\');')[0]; // returns an array of statements
    var result = utils.getPropsFromRequire(ast);
    var expected = { variableName: ['includes', 'pick'], moduleName: 'lodash', propName: ['includes', 'pick'] };

    assert.deepEqual(result, expected);
  });

  it('var { includes: foo } = require(\'lodash\') -> {variableName: [\'includes\'], moduleName: \'lodash\', propName: [\'foo\']}', function() {
    var ast = toAST('var { includes: foo } = require(\'lodash\');')[0]; // returns an array of statements
    var result = utils.getPropsFromRequire(ast);
    var expected = { variableName: ['includes'], moduleName: 'lodash', propName: ['foo'] };

    assert.deepEqual(result, expected);
  });
});

describe('util.createImportStatement(moduleName [, variableName])', function(){

  it('-> `import \'jquery\'` when passed 1 param', function() {
    var result = toString(utils.createImportStatement('jquery'));
    var expected = 'import \'jquery\';';

    assert.deepEqual(result, expected);
  });

  it('-> `import $ from \'jquery\'` when passed 2 params', function() {
    var result = toString(utils.createImportStatement('jquery', '$'));
    var expected = 'import $ from \'jquery\';';

    assert.deepEqual(result, expected);
  });

  it('-> `import foo from \'bar\'` when passed 3 params where propName is default', function() {
    var result = toString(utils.createImportStatement('bar', 'foo', 'default'));
    var expected = 'import foo from \'bar\';';

    assert.deepEqual(result, expected);
  });

  it('-> `import {pluck} from \'jquery\'` when passed 3 params', function() {
    var result = toString(utils.createImportStatement('jquery', 'pluck', 'pluck'));
    var expected = 'import { pluck } from \'jquery\';';

    assert.deepEqual(result, expected);
  });

  it('-> `import {fetch as pluck} from \'jquery\'` when passed 3 params', function() {
    var result = toString(utils.createImportStatement('jquery', 'fetch', 'pluck'));
    var expected = 'import { pluck as fetch } from \'jquery\';';

    assert.deepEqual(result, expected);
  });

  it('-> `import {includes, omit} from \'lodash\'` when passed 2 params (second one being an array of strings)', function() {
    var result = toString(utils.createImportStatement('lodash', ['includes', 'omit']));
    var expected = 'import { includes, omit } from \'lodash\';';

    assert.deepEqual(result, expected);
  });

  it('-> `import {includes as foo, omit as bar} from \'lodash\'` when passed 2 array params', function() {
    var result = toString(utils.createImportStatement('lodash', ['includes', 'omit'], ['foo', 'bar']));
    var expected = 'import { includes as foo, omit as bar } from \'lodash\';';

    assert.deepEqual(result, expected);
  });

  it('-> `import {includes, omit} from \'lodash\'` when passed 2 array params with the same values', function() {
    var result = toString(utils.createImportStatement('lodash', ['includes', 'omit'], ['includes', 'omit']));
    var expected = 'import { includes, omit } from \'lodash\';';

    assert.deepEqual(result, expected);
  });
});

// unroll single var statements?
// Q: What should this actually do? Keep them like that?
// Return an array of each of the statements to be inserted...
// Turns a single var statement into many expressions.
// Than can then be processed individually, and replaced wholesale...
describe('util.singleVarToExpressions(ast)', function(){

  it('should turn a single var statement into an array of expressions', function() {
    var string = ''
    + 'var jamis = \'bar\',\n'
    + ' _ = require(\'lodash\'),\n'
    + ' lodash = require(\'undescore\'),\n'
    + ' bar,\n'
    + ' foo = \'bar\',\n'
    + ' $ = require(\'jquery\');';

    // TODO: Consider moving this into a fixture file instead...
    var expected = ''
    + 'var jamis = \'bar\';\n'
    + 'var _ = require(\'lodash\');\n'
    + 'var lodash = require(\'undescore\');\n'
    + 'var bar;\n'
    + 'var foo = \'bar\';\n'
    + 'var $ = require(\'jquery\');';


    var ast = toAST(string)[0]; // returns an array of statements
    var result = toString(utils.singleVarToExpressions(ast));

    assert.deepEqual(result, expected);
  });
});

describe('util.getValidRecastArgs', function(){
  var validRecastArgs = utils.getValidRecastArgs();

  it('should have 14 valid arguments', function() {
    assert.equal(validRecastArgs.length, 14);
  });
});

describe('util.getDefaultTransformConfig', function(){
  var defaultTransformConfig = utils.getDefaultTransformConfig();

  it('should return an object', function() {
    assert.equal(typeof defaultTransformConfig, 'object');
  });

  it('should not have any defined properties', function() {
    assert.equal(Object.keys(defaultTransformConfig).length, 0);
  })
});

describe('util.getDefaultRecastConfig', function(){
  var defaultRecastConfig = utils.getDefaultRecastConfig();

  it('should return an object', function() {
    assert.equal(typeof defaultRecastConfig, 'object');
  });

  it('should define a default "quote" value of "single"', function() {
    assert.equal(defaultRecastConfig.quote, 'single');
  })
});

describe('util.getConfig', function(){
  var defaultConfig = {
    example: 42,
    sample: 'a'
  };

  it('should override default config with provided input', function() {
    var config = utils.getConfig({ example: 43, another: 'b' }, defaultConfig);
    assert.equal(config.example, 43);
    assert.equal(config.sample, 'a');
    assert.equal(config.another, 'b');
  })
});

describe('util.getTransformConfig', function() {
  var defaultConfig = utils.getDefaultTransformConfig();

  it('should equal the default config given no inputs', function() {
    assert.deepEqual(utils.getTransformConfig(), defaultConfig);
  });

  it('should equal the default config given invalid, non-object inputs', function() {
    assert.deepEqual(utils.getTransformConfig(null), defaultConfig);
    assert.deepEqual(utils.getTransformConfig(undefined), defaultConfig);
    assert.deepEqual(utils.getTransformConfig(14), defaultConfig);
    assert.deepEqual(utils.getTransformConfig('14'), defaultConfig);
    assert.deepEqual(utils.getTransformConfig(['14']), defaultConfig);
  });

  it('should be able to override a default config value', function() {
    var config = utils.getTransformConfig({ example: 'double' });

    var expectedConfig = assign({}, defaultConfig, {
      example: 'double'
    });

    assert.deepEqual(config, expectedConfig);
  });

  it('should filter out recast keys', function() {
    var options = {
      lineTerminator: true,
      reuseWhitespace: true,
      someKey: true,
      sourceMapName: true,
      tabWidth: true
    };
    var expected = { someKey: true };
    assert.deepEqual(utils.getTransformConfig(options), expected);
  });
});

describe('util.getRecastConfig', function() {
  var defaultConfig = utils.getDefaultRecastConfig();

  it('should equal the default config given no inputs', function() {
    assert.deepEqual(utils.getRecastConfig(), defaultConfig);
  });

  it('should equal the default config given invalid, non-object inputs', function() {
    assert.deepEqual(utils.getRecastConfig(null), defaultConfig);
    assert.deepEqual(utils.getRecastConfig(undefined), defaultConfig);
    assert.deepEqual(utils.getRecastConfig(14), defaultConfig);
    assert.deepEqual(utils.getRecastConfig('14'), defaultConfig);
    assert.deepEqual(utils.getRecastConfig(['14']), defaultConfig);
  });

  it('should be able to override a default config value', function() {
    var config = utils.getRecastConfig({ quote: 'double' });

    var expectedConfig = assign({}, defaultConfig, {
      quote: 'double'
    });

    assert('quote' in defaultConfig);
    assert.deepEqual(config, expectedConfig);
  });

  it('should only accept recast keys', function() {
    var options = {
      lineTerminator: true,
      reuseWhitespace: true,
      someKey: true, // Should not be present in recast config
      sourceMapName: true,
      tabWidth: true
    };
    var expected = assign({}, defaultConfig, {
      lineTerminator: true,
      reuseWhitespace: true,
      sourceMapName: true,
      tabWidth: true
    });
    assert.deepEqual(utils.getRecastConfig(options), expected);
  });
})

/******************************************
 * Test Helpers...
 ******************************************/

/**
 * Converst the AST obj/tree and turns it into readable code.
 * @param ast {obj} - ast obj tree
 * Returns a string.
 *
 */
function toString(ast) {
  // if you're just passing in an array of ast's, convert to an ast obj.
  if (Array.isArray(ast)) {
    ast = {
        type: 'Program',
        body: ast
    };
  }

  // force single quotes in the output...
  return recast.print(ast, { quote: 'single' }).code;

}

/**
 * Turns a string into an AST obj.
 * And returns the body, not the full program
 * @return {array} of AST statements that are the body of the code.
 */
function toAST(code) {
  return recast.parse(code).program.body;
}
