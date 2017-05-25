// TODO: See if we should decouple the actual rule well enough that it can be run from both the command line and the
// node interface (test)
/**
 * DEPS
 */
var jscodeshift = require('jscodeshift');
var fs = require('fs');
var path = require('path');
var assert = require('assert');

/**
 * LOCAL DEPS
 */
var cjsTransform = require('../../transforms/cjs');

/**
 * TESTS
 *
 */
describe('CJS transform', function() {
  it('require("x")', helper.bind(this, 'standalone'))
  it('var ... = require("x")', helper.bind(this, 'declaration'))
  it('var ... = require("y").x', helper.bind(this, 'object'))
  it('var ... = require("y")( ... )', helper.bind(this, 'called'))
  it('var x = { x: require("x"), y: require("y"), ... }', helper.bind(this, 'mapper'))
  it('should ignore requires deepr than top-level', helper.bind(this, 'ignore'))
  it('should preserve comments before and after require\'s', helper.bind(this, 'comments'))
  it('should hoist require declarations and expressions when "hoist" flag is enabled', helperWithOptions({ hoist: true }).bind(this, 'hoist'))
});

function helper (name) {
  var src = fs.readFileSync(path.resolve(__dirname, '../fixtures/cjs/' + name + '.before.js')).toString();
  var expectedSrc = fs.readFileSync(path.resolve(__dirname, '../fixtures/cjs/' + name + '.after.js')).toString();
  var result = cjsTransform({ source: src }, { jscodeshift: jscodeshift });
  assert.equal(result, expectedSrc);
}

function helperWithOptions(options) {
  return function (name) {
    var src = fs.readFileSync(path.resolve(__dirname, '../fixtures/cjs/' + name + '.before.js')).toString();
    var expectedSrc = fs.readFileSync(path.resolve(__dirname, '../fixtures/cjs/' + name + '.after.js')).toString();
    var result = cjsTransform({ source: src }, { jscodeshift: jscodeshift }, options);
    assert.equal(result, expectedSrc);
  }
}
