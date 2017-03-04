// top level comment
fn(require('ignore-func-call'));
require ('es6-promise').polyfill();
describe('foo', function () {
    var Foo = require('Foo')
    beforeEach(function () {
        this.foo = require('foo')
        var test = new fn(require('foo'))
    })
})
var x = {
    get bar () { return require('bar') },
}
