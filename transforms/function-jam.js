import { reduce } from "ramda"
import { camelCase } from "text-case"
import isVD from "../selectors/predicates/is-variabledeclarator"
import getVDBody from "../selectors/accessors/get-variabledeclarator-name"
import getVDParams from "../selectors/accessors/get-variabledeclarator-params"
import getVDName from "../selectors/accessors/get-variabledeclarator-name"
export default function transformer(file, api) {
  const j = api.jscodeshift
  const news = []

  const makeFunction = (name, params, simulacra) => {
    const func = j.arrowFunctionExpression(params, simulacra)
    return j.variableDeclaration("const", [
      j.variableDeclarator(j.identifier(name), func)
    ])
  }
  j(file.source)
    .find(j.Identifier)
    .filter(isVD)
    .forEach((x) => {
      news.push({
        name: getVDName(x),
        params: getVDParams(x),
        body: getVDBody(x)
      })
    })

  const mashed = reduce(
    (agg, { name, params: decParams, body: decBody }) => ({
      ...agg,
      names: (agg.names || []).concat(name),
      params: (agg.params || []).concat(decParams),
      bodies: (agg.bodies || []).concat(decBody)
    }),
    {},
    news
  )
  const names = camelCase(mashed.names.join(""))
  const params = mashed.params
  const body = mashed.bodies
    .reduce((agg, xx) => {
      return agg.concat(xx.body)
    }, [])
    .sort((a, b) => a.type === "ReturnStatement")
  const out = makeFunction(names, params, j.blockStatement(body))
  return j(out).toSource()
}
