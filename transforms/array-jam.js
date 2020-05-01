import R from "ramda"
import getLiteralArrayValues from "../selectors/accessors/get-arrayexpression-elements"
import isArray from "../selectors/predicates/is-array"
import getArrayElements from "../selectors/accessors/get-array-elements"

export default function transformer(file, api) {
  const jjj = api.jscodeshift
  const news = []
  const sourcy = (zz) => jjj(zz).toSource()
  jjj(file.source)
    .find(jjj.Identifier)
    .filter(isArray)
    .forEach((z) => {
      news.push(getArrayElements(z))
    })
  const reduced = news.reduce((agg, xx) => agg.concat(xx), [])
  const result = jjj.variableDeclaration("const", [
    jjj.variableDeclarator(
      jjj.identifier("rayRay"),
      jjj.arrayExpression(reduced)
    )
  ])
  return [result].map(sourcy).join("\n\n")
}
