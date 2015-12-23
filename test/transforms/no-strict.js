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
var cjsTransform = require('../../transforms/no-strict');

/**
 * TESTS
 *
 */
describe('CJS transform', function() {
	it('should convert "use strict" => "" ', function() {
		var src = fs.readFileSync(path.resolve(__dirname, '../fixtures/no-strict.before.js')).toString();
		var expectedSrc = fs.readFileSync(path.resolve(__dirname, '../fixtures/no-strict.after.js')).toString();
		var result = cjsTransform({ source: src }, { jscodeshift: jscodeshift });
		assert.equal(result, expectedSrc);
	});
});
