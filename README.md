# 5to6-codemod

A collection of [codemods](https://medium.com/@cpojer/effective-javascript-codemods-5a6686bb46fb) that allow you to transform your
js code from ES5 to ES6 using [jscodeshift](https://github.com/facebook/jscodeshift).

## Usage

1. `npm install -g jscodeshift`
2. `npm install 5to6-codemod`
3. `jscodeshift -t node_modules/5to6-codemod/transforms/[transform].js [files]`
4. Review changes via `git diff`. Keep what you want, throw it out if you don't. Magic!

## Transforms

- `amd` - Transforms AMD style modules to ES6 `import`/`export`
- `cjs` - Transforms CommonJS style `require()` calls to ES6 `import` statements
- `no-strict` - Removes "use strict" statements
- `exports` - Move CommonJS style `module.exports` statements to ES6 `export` statements
- `let` - Replace all `var` calls to use `let`

## Known issues

* Currently loses comments if directly before the `require()` statement.
* `require()` calls in single var statements get reordered, and moved before the single var after conversion to import.
* Can't automagically figure out when you want to use `import * as varName`.
* End-of-line comments also missing in many situations
