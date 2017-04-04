// stacked comment
var x = require('var-stacked-comment');
var x = require('var-no-comment');
var x = require('var-inline-comment'); // with inline comment
var { x, y } = require('var-decomposition');
var { x: z, y: a } = require('var-renamed-decomposition');
var x = 'x',
    y = require('multi-var-y'),
    z = require('multi-var-z'),
    unassigned,
    foo = 'bar',
    $ = require('multi-var-$');
