const R = require("ramda")
const adjustFirst = R.curry((fn, z) => fn(z[0]) + z.slice(1))
const capitalize = adjustFirst(R.toUpper)
const lowerFirst = adjustFirst(R.toLower)
export default function transformer(file, api) {
  const jjj = api.jscodeshift
  const news = []
  const sourcy = (zz) => jjj(zz).toSource()

  jjj(file.source)
    .find(jjj.MethodDefinition)
    .forEach((z) => {
      const body = R.path(["value", "value", "body"], z)
      const className = R.path(["parent", "parent", "value", "id", "name"], z)
      const fnName = R.path(["value", "key", "name"], z)

      const methodName = capitalize(fnName)
      const nname = className + methodName
      const newName = R.pipe(lowerFirst, jjj.identifier)(nname)
      // console.log("body", JSON.stringify(body, null, 2));
      const prependedBody = body
      const params = R.path(["value", "value", "params"], z)
      const funcBody = jjj.arrowFunctionExpression(params, prependedBody)
      news.push(
        jjj.variableDeclaration("const", [
          jjj.variableDeclarator(newName, funcBody)
        ])
      )
    })
    .remove()

  return news.map(sourcy).join("\n\n")
}
