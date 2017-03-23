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
  it('should ignore module = "a"', helper.bind(this, 'ignore'));

  it('should convert exports.house() -> house()', helper.bind(this, 'called'));
  it('should convert module.exports = (...), module.exports.house = (...); -> export default (...), export const house = (...);', helper.bind(this, 'default-with-keyed'));
  it('should convert module.exports = (...) -> export default (...)', helper.bind(this, 'default'));
  it('should convert module.exports.thing -> export const thing', helper.bind(this, 'keyed'));
  it(
    'should convert exports.house() -> house()',
    helper.bind(this, 'called')
  );
  it(
    'should convert module.exports = (...), module.exports.house = (...); -> export default (...), export const house = (...);',
    helper.bind(this, 'default-with-keyed')
  );
  it(
    'should convert module.exports = (...) -> export default (...)',
    helper.bind(this, 'default')
  );
  it(
    'should convert module.exports.thing -> export const thing',
    helper.bind(this, 'keyed')
  );
});

function helper(name) {
  var src = fs.readFileSync(path.resolve(__dirname, '../fixtures/exports/' + name + '.before.js')).toString();
  var expectedSrc = fs.readFileSync(path.resolve(__dirname, '../fixtures/exports/' + name + '.after.js')).toString();
  var result = exportsTransform({ source: src }, { jscodeshift: jscodeshift });
  assert.equal(result, expectedSrc);
}
