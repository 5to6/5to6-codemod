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
var nsTransform = require('../../transforms/simple-arrow');

/**
 * TESTS
 *
 */
describe('no-strict transform', function() {
	it('should convert single return function expressions to arrow functions ', function() {
		var src = fs.readFileSync(path.resolve(__dirname, '../fixtures/simple-arrow.before.js')).toString();
		var expectedSrc = fs.readFileSync(path.resolve(__dirname, '../fixtures/simple-arrow.after.js')).toString();
		var result = nsTransform({ source: src }, { jscodeshift: jscodeshift });
		assert.equal(result, expectedSrc);
	});
});
