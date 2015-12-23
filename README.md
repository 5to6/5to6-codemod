# 5to6

A collection of [codemods](https://medium.com/@cpojer/effective-javascript-codemods-5a6686bb46fb) that allow you to transform your
js code from ES5 to ES6 using [jscodeshift](https://github.com/facebook/jscodeshift).

## Usage

1. `npm install -g jscodeshift`
2. `npm install es6-codemod`
3. `jscodeshift -t node_modules/es6-codemod/transforms/[transform].js [files]`
4. Review changes via `$ git diff`. Keep what you want, throw it out if you don't. Magic!

## Transforms

- `amd` - Transforms AMD style modules to ES6 imports/exports
- `cjs` - Transforms CommonJS style modules to ES6 imports/exports
- `no-strict` - Removes "use strict" statements

## Known issues
* Currently loses comments if directly before the `require()` statement.
* require() calls in single var statements get reordered, and moved before the single var after conversion to import.
* can't automagically figure out when you want to use `import * as varName`.

## TODO:
- [ ] Fix single var issues
- [ ] Avoid losing info like comments when transforming require() statements.

## Appendix

### In Depth Example (CJS))

Apply a transform to a file via [jscodeshift](https://github.com/facebook/jscodeshift):
`$ jscodeshift -t cjs.js fileToTransform.js`

**Before**
```js
var jamis = require('jquery');
var $ = require('jquery');
var $ = require("jquery");
require('something');

var foo = bar;

// some comment
var jamis = 'bar',
    _ = require('lodash'),
    lodash = require('underscore'),
    bar,
    foo = 'bar',
    $ = require('jquery');

var routeTo = require('../routeHelper').routeTo;
var fetch = require('../someUtil').pluck;
```

**After**
```js
import jamis from 'jquery';
import $ from 'jquery';
import $ from 'jquery';
import 'something';

var foo = bar;

import _ from 'lodash';
import lodash from 'underscore';
import $ from 'jquery';

// some comment
var jamis = 'bar', bar, foo = 'bar';

import {routeTo} from '../routeHelper';
import {pluck as fetch} from '../someUtil';

```