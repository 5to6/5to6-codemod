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
var nsTransform = require('../../transforms/let');

/**
 * TESTS
 *
 */
describe('let transform', function() {
	it('should convert var x => let x', function() {
		var src = fs.readFileSync(path.resolve(__dirname, '../fixtures/let.before.js')).toString();
		var expectedSrc = fs.readFileSync(path.resolve(__dirname, '../fixtures/let.after.js')).toString();
		var result = nsTransform({ source: src }, { jscodeshift: jscodeshift });
		assert.equal(result, expectedSrc);
	});
});
