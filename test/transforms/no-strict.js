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
var nsTransform = require('../../transforms/no-strict');

/**
 * TESTS
 *
 */
describe('no-strict transform', function() {
	it('should convert "use strict" => "" ', function() {
		var src = fs.readFileSync(path.resolve(__dirname, '../fixtures/no-strict.before.js')).toString();
		var expectedSrc = fs.readFileSync(path.resolve(__dirname, '../fixtures/no-strict.after.js')).toString();
		var result = nsTransform({ source: src }, { jscodeshift: jscodeshift });
		assert.equal(result, expectedSrc);
	});
	it('should not duplicate leading comment ', function() {
		var src = fs.readFileSync(path.resolve(__dirname, '../fixtures/no-strict-closure.before.js')).toString();
		var expectedSrc = fs.readFileSync(path.resolve(__dirname, '../fixtures/no-strict-closure.after.js')).toString();
		var result = nsTransform({ source: src }, { jscodeshift: jscodeshift });
		assert.equal(result, expectedSrc);
	});
});
