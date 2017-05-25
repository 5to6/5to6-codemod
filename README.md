[![Build Status](https://travis-ci.org/5to6/5to6-codemod.svg)](https://travis-ci.org/5to6/5to6-codemod)
[![GitHub version](https://img.shields.io/github/tag/5to6/5to6-codemod.svg)](https://github.com/5to6/5to6-codemod)
[![NPM version](https://img.shields.io/npm/v/5to6-codemod.svg)](https://www.npmjs.com/package/5to6-codemod)
[![Downloads](https://img.shields.io/npm/dm/5to6-codemod.svg)](https://www.npmjs.com/package/5to6-codemod)

# 5to6-codemod

A collection of [codemods](https://medium.com/@cpojer/effective-javascript-codemods-5a6686bb46fb) that allow you to transform your JavaScript code from ES5 to ES6 using [jscodeshift](https://github.com/facebook/jscodeshift).

## Usage

1. `npm install -g jscodeshift`
2. `npm install 5to6-codemod`
3. `jscodeshift -t node_modules/5to6-codemod/transforms/[transform].js [files]`
4. Review changes via `git diff`. Keep what you want, throw it out if you don't. Magic!

## Option flags

When executing codemods, you can configure options like so:

`jscodeshift -t node_modules/5to6-codemod/transforms/[transform].js [files] --key=value`

### Recast options

Our transforms will automatically distinguish and pass through Recast config keys via [jscodeshift](https://github.com/facebook/jscodeshift#passing-options-to-recast). Official documentation for Recast's configuration can be found [here](https://github.com/benjamn/recast/blob/4899a70d4b9aeec9c599065be3338464b7047767/lib/options.js#L1). We currently support the following Recast keys:
- `esprima`
- `inputSourceMap`
- `lineTerminator`
- `quote`
- `range`
- `reuseWhitespace`
- `sourceFileName`
- `sourceMapName`
- `sourceRoot`
- `tabWidth`
- `tolerant`
- `trailingComma`
- `useTabs`
- `wrapColumn`

## Transforms

- `amd` - Transforms AMD style modules to ES6 `import`/`export`
- `cjs` - Transforms CommonJS style `require()` calls to ES6 `import` statements
	- This transformation accepts the following option flags:
		- `hoist`: Enables hoisting require statements to the top
- `no-strict` - Removes "use strict" statements
- `exports` - Move CommonJS style `module.exports` statements to ES6 `export` statements
- `named-export-generation` - Adds named exports corresponding to default export object keys. Only valid for ES6 modules exporting an object as the default export.
- `let` - Replace all `var` calls to use `let`
- `simple-arrow` - Replace all function expressions with a body of a sole return statement into arrow functions

## Known issues

* Can't automagically figure out when you want to use `import * as varName`.
* End-of-line comments also missing in many situations
* `simple-arrow` loses comments in the function expression body
