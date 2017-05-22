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
var namedExportsTransform = require('../../transforms/named-export-generation');

/**
 * TESTS
 *
 */
describe('Named exports generation transform', function() {
  it(
    'should generate named exports for an exported declarator',
    helper.bind(this, 'declared')
  );
  it(
    'should generate named exports for an exported declarator that has been mutated',
    helper.bind(this, 'declared-mutated')
  );
  it(
    'should generate named exports for an exported object expression',
    helper.bind(this, 'expression')
  );
	it(
    'should generate named exports if object keys are references',
    helper.bind(this, 'references')
  );
	it(
    'should ignore computed property keys for an exported object expression',
    helper.bind(this, 'ignore')
  );
})

function helper(name) {
  var src = fs.readFileSync(path.resolve(__dirname, '../fixtures/named-export-generation/' + name + '.before.js')).toString();
  var expectedSrc = fs.readFileSync(path.resolve(__dirname, '../fixtures/named-export-generation/' + name + '.after.js')).toString();
  var result = namedExportsTransform({ source: src }, { jscodeshift: jscodeshift });
  assert.equal(result, expectedSrc);
}
