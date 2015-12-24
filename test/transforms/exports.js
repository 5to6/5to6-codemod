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
var exportsTransform = require('../../transforms/exports');

/**
 * TESTS
 *
 */
describe('Exports transform', function() {
  it('should convert module.exports = a -> export default a', function() {
    var src = fs.readFileSync(path.resolve(__dirname, '../fixtures/exports.before.js')).toString();
    var expectedSrc = fs.readFileSync(path.resolve(__dirname, '../fixtures/exports.after.js')).toString();
    var result = exportsTransform({ source: src }, { jscodeshift: jscodeshift });
    assert.equal(result, expectedSrc);
  });
});
