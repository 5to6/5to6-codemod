// TODO: See if we should decouple the actual rule well enough that it can be run from both the command line and the
// node interface (test)
/**
 * DEPS
 */
var jscodeshift = require('jscodeshift');
var recast = require('recast');
var fs = require('fs');
var expect = require('expect.js');

/**
 * LOCAL DEPS
 */
var transformToTest = require('../transforms/requireToImport.js');
var api = {jscodeshift: jscodeshift};
var utils = require('../utils/main');

/**
 * TESTS
 *
 */

describe('util.getPropsFromRequire(ast)', function(){

  it("require('something') -> {moduleName: 'something'}", function() {
    var ast = toAST("require('underscore');")[0]; // returns an array of statements
    var result = utils.getPropsFromRequire(ast);
    var expected = {variableName: undefined, moduleName: 'underscore'};

    expect(result).to.eql(expected);
  });

  it("var _ = require('underscore') -> {variableName = '_', moduleName: 'something'}", function() {
    var ast = toAST("var _ = require('underscore');")[0]; // returns an array of statements
    var result = utils.getPropsFromRequire(ast);
    var expected = {variableName: '_', moduleName: 'underscore'};

    expect(result).to.eql(expected);
  });
});

describe('util.createImportStatement(moduleName [, variableName])', function(){

  it('-> `import \'jquery\'` when passed 1 param', function() {
    var result = toString(utils.createImportStatement('jquery'));
    var expected = "import 'jquery';";

    expect(result).to.be(expected);
  });

  it('-> `import $ from \'jquery\'` when passed 2 params', function() {
    var result = toString(utils.createImportStatement('jquery', '$'));
    var expected = "import $ from 'jquery';";

    expect(result).to.be(expected);
  });

});

// unroll single var statements?
// Q: What should this actually do? Keep them like that?
// Return an array of each of the statements to be inserted...
// Turns a single var statement into many expressions.
// Than can then be processed individually, and replaced wholesale...
describe('util.singleVarToExpressions(ast)', function(){

  it("should turn a single var statement into an array of expressions'}", function() {
    var string =  ""
    + "var jamis = 'bar',\n"
    + " _ = require('lodash'),\n"
    + " lodash = require('undescore'),\n"
    + " bar,\n"
    + " foo = 'bar',\n"
    + " $ = require('jquery');"

    // TODO: Consider moving this into a fixture file instead...
    var expected =  ""
    + "var jamis = 'bar';\n"
    + "var _ = require('lodash');\n"
    + "var lodash = require('undescore');\n"
    + "var bar;\n"
    + "var foo = 'bar';\n"
    + "var $ = require('jquery');"


    var ast = toAST(string)[0]; // returns an array of statements
    var result = toString(utils.singleVarToExpressions(ast));

    expect(result).to.eql(expected);
  });
});

/******************************************
 * Test Helpers...
 ******************************************/

// FIXME: can it just be sync? does it matter?
/**
 * Reads the file and calls the cb with the contents as a string.
 *
 */
function getSource(path, cb) {
  fs.readFile(process.cwd() + path, function (err, data) {
    if (err) throw err;

    return cb(null, data.toString());
  });
}



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
    }
  }

  // force single quotes in the output...
  return recast.print(ast, {quote: 'single'}).code;

}

/**
 * Turns a string into an AST obj.
 * And returns the body, not the full program
 * @return {array} of AST statements that are the body of the code.
 */
function toAST(code) {
  return recast.parse(code).program.body;
}

