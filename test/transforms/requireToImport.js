// TODO: See if we should decouple the actual rule well enough that it can be run from both the command line and the
// node interface (test)
/**
 * DEPS
 */
var jscodeshift = require('jscodeshift');
var recast = require('recast');
var fs = require('fs');
var expect = require('expect.js');

/**
 * LOCAL DEPS
 */
var transformToTest = require('../../transforms/requireToImport.js');
var api = {jscodeshift: jscodeshift};
var utils = require('../../utils/main');

/**
 * TESTS
 *
 */
describe('requireToImport transform', function() {
  it('should convert require(\'jquery\') -> import \'jquery\' ', function(done) {

    var src = '/test/fixtures/requireToImportBefore.js';
    var expected = '/test/fixtures/requireToImportAfter.js';

    // pull in the before, transform, and assert the after against the result

    // for a large file, lets do a before, and expected
    getSource(src, expected, function (err, src, expectedSrc) {
      var fileInfo = {source: src};

      var result = transformToTest(fileInfo, api);

      console.log('result \n ********************* \n', result);
      expect(result).to.be(expectedSrc)
      // console.log('result', result);
      done();
    });
    // expect(methods.length).toBe(4)
    // expect(methods).toContain('subscribe')
    // expect(methods).toContain('dispatch')
    // expect(methods).toContain('getState')
    // expect(methods).toContain('replaceReducer')
  })
});

// console.log(data);
// console.log('jscodeshift', jscodeshift(data.toString()));
// FIXME: Pass this to the transform function...
// FIXME: Can we shim it to require the same interface?
// var result = jscodeshift(src)
// .findVariableDeclarators('foo')
// .renameTo('bar')
// .toSource();

// apply the transform



// TODO: Now assert on the result.


/******************************************
 * Test Helpers...
 ******************************************/

// FIXME: can it just be sync? does it matter?
/**
 * Reads the file and calls the cb with the contents as a string.
 *
 */
function getSource(path, path2, cb) {
  fs.readFile(process.cwd() + path, function (err, data) {
    if (err) throw err;

    var src = data.toString();

    // if 2nd param is the cb function, call it and return.
    if (typeof path2 === 'function') {
      cb = path2;
      return cb(null, src);
    }

    // read in the src of the 2nd file
    fs.readFile(process.cwd() + path2, function (err, data2) {
      if (err) throw err;

      var src2 = data2.toString();

      return cb(null, src, src2);
    });


  });
}



/**
 * Converst the AST obj/tree and turns it into readable code.
 * Returns a string.
 *
 */
function toString(ast) {
  // force single quotes in the output...
  return recast.print(ast, {quote: 'single'}).code;

}

/**
 * Turns a string into an AST obj.
 * And returns the body, not the full program
 * @return {array} of AST statements that are the body of the code.
 */
function toAST(code) {
  return recast.parse(code).program.body;
}


