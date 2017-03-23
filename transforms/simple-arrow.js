/*
  This CodeMod looks for any single line function declaration that has a single return statement,
  And converts it to an arrow function.

  e.g.

  ```
  obj.a = function (str){
    return str.toUpperCase()
  }
  ```

  Becomes:

  ```
  obj.a = str => str.toUpperCase()

  It leaves all other functions, that have more than one statement in them, or those that don't return alone.

*/

var util = require('../utils/main');

function filterTargetFns (p) {
  return p.node.body.type === 'BlockStatement'
  && p.node.body.body.length === 1
  && p.node.body.body[0].type === 'ReturnStatement';
}

module.exports = function(file, api, options) {
  var j = api.jscodeshift;

  return j(file.source)
    .find(j.FunctionExpression)
    .filter(filterTargetFns)
    .replaceWith( path =>
      j.arrowFunctionExpression(
        path.node.params,
        path.node.body.body[0].argument
      )
    )
    .toSource(util.getRecastConfig(options));
};
