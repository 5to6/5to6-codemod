var jscodeshift = require('jscodeshift');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var importCleanup = require('../../transforms/import-cleanup');

describe('import-cleanup transform', function() {
  it('should transform', helper.bind(undefined, 'common'));
});

function helper(name) {
  var src = fs.readFileSync(path.resolve(__dirname, '../fixtures/import-cleanup/' + name + '.before.js')).toString();
  var expectedSrc = fs.readFileSync(path.resolve(__dirname, '../fixtures/import-cleanup/' + name + '.after.js')).toString();
  var result = importCleanup({ source: src }, { jscodeshift: jscodeshift });
  assert.equal(result, expectedSrc);
}
