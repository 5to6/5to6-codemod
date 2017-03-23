// stacked comment
var a = require('var-stacked-comment')();
var b = require('var-no-comment')('arg for b');
var c = require('var-inline-comment')({ some: 'arg' }); // with inline comment

var { d, e } = require('var-decomposition')();

var f = 'x',
    g = require('multi-var-g')(),
    h = require('multi-var-h')(),
    unassigned,
    i = 'bar',
    j = require('multi-var-j')();
