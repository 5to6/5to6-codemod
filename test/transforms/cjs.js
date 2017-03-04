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
  it('require("x")', helper.bind(this, 'cjs-standalone'))
  it('var ... = require("x")', helper.bind(this, 'cjs-declaration'))
  it('var ... = require("y").x', helper.bind(this, 'cjs-object'))
  it('should ignore requires deepr than top-level', helper.bind(this, 'cjs-ignore'))
});

function helper (name) {
  var src = fs.readFileSync(path.resolve(__dirname, '../fixtures/' + name + '.before.js')).toString();
  var expectedSrc = fs.readFileSync(path.resolve(__dirname, '../fixtures/' + name + '.after.js')).toString();
  var result = cjsTransform({ source: src }, { jscodeshift: jscodeshift });
  assert.equal(result.trim(), expectedSrc.trim());
}
