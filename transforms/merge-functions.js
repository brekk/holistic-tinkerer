const makeFunctionGivenJ = (j) => (name, params, body) => {
  const func = j.arrowFunctionExpression(params, body)
  return j.variableDeclaration("const", [
    j.variableDeclarator(j.identifier(name), func)
  ])
}

module.exports = function transformer(file, api) {
  const j = api.jscodeshift
  const news = []
  const makeFunction = makeFunctionGivenJ(j)

  const capitalize = (z) => z[0].toUpperCase() + z.slice(1)
  const uncapitalize = (z) => z[0].toLowerCase() + z.slice(1)
  const camelize = (z) => uncapitalize(z[0]) + z.slice(1).map(capitalize)

  j(file.source)
    .find(j.Identifier)
    .filter((x) => x.parent.value.type === "VariableDeclarator")
    .forEach((x) => {
      news.push({
        name: x.value.name,
        params: x.parent.value.init.params,
        body: x.parent.value.init.body
      })
    })

  const newNews = news.reduce((agg, { name, params, body: bb }) => {
    agg.names = (agg.names || []).concat(name)
    agg.paramses = (agg.paramses || []).concat(params)
    agg.bodies = (agg.bodies || []).concat(bb)
    return agg
  }, {})
  const names = camelize(newNews.names)
  const paramses = newNews.paramses
  const body = newNews.bodies
    .reduce((agg, xx) => {
      return agg.concat(xx.body)
    }, [])
    .sort((a) => a.type === "ReturnStatement")
    .map((xx) => {
      console.log("xx", xx.type)
      if (xx.type === "ReturnStatement") {
        const arrayed = j.arrayExpression([xx.argument])
        return j.returnStatement(arrayed)
      }
      return xx
    })
  const out = makeFunction(names, paramses, j.blockStatement(body))
  return j(out).toSource()
}
