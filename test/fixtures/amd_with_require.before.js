define(function(require) {
    var a = require('a');
    var b = require('b');
    var c = require('c');
    var d, e, f, g = require('g');

    // let's define some things
    var myModule = {
        doStuffWithThings(val) {
            return a.morgify(val);
        },
    };

    return myModule;
});
