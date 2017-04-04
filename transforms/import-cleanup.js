/**
 * import-cleanup - Combines and dedupes duplicate imports
 */

var util = require('../utils/main');

module.exports = function transformer(file, api, options) {
  const j = api.jscodeshift;

  var sourceLookup = {}
  return j(file.source)
    .find(j.ImportDeclaration)
    // ignore import * as ...
    .filter(p => {
      return p.parent.node.type === 'Program'
        && p.get('specifiers', 0, 'type').value !== 'ImportNamespaceSpecifier'
    })
    .forEach(p => {
        var source = p.get('source', 'value').value
        var existingImport = sourceLookup[source]

        if (!existingImport) {
          sourceLookup[source] = p
          return
        }

        var specifiers = dedupe(normalize(existingImport, j).concat(normalize(p, j)))
        var updatedImport = j.importDeclaration(specifiers, p.value.source)
        j(existingImport).replaceWith(updatedImport)
        j(p).remove()
    })
    .toSource(util.getRecastConfig(options));
}

function normalize (importDecl, j) {
  return importDecl.value.specifiers.map(specifier => {
    const localName = specifier.local.name
    const importedName = specifier.imported ? specifier.imported.name : 'default'
    return j.importSpecifier(j.identifier(importedName), j.identifier(localName))
  })
}

function dedupe (specifiers) {
  var added = {}
  var output = []

  specifiers.forEach(specifier => {
    var localName = specifier.local.name
    if (added[localName]) return
    output.push(specifier)
    added[localName] = true
  })

  return output
}
