import { prop, map, pipe, propEq, curry, reduce } from "ramda"
import { camelCase } from "text-case"
import isVD from "../selectors/predicates/is-variabledeclarator"
import getVDBody from "../selectors/accessors/get-variabledeclarator-body"
import getVDParams from "../selectors/accessors/get-variabledeclarator-params"
import getVDName from "../selectors/accessors/get-variabledeclarator-name"
import { inspect } from "xtrace"

const isReturnStatement = propEq("type", "ReturnStatement")
export default function transformer(file, api) {
  const j = api.jscodeshift
  const news = []

  const makeFunction = curry((name, par, simulacra) => {
    const func = j.arrowFunctionExpression(par, simulacra)
    return j.variableDeclaration("const", [
      j.variableDeclarator(j.identifier(name), func)
    ])
  })
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

  return pipe(
    reduce(
      (agg, { name, params: decParams, body: decBody }) => ({
        ...agg,
        names: agg.names.concat(name),
        params: agg.params.concat(decParams),
        bodies: agg.bodies.concat(decBody)
      }),
      { names: [], params: [], bodies: [] }
    ),
    ({ names, params, bodies }) => {
      const name = camelCase(names.join(" "))
      // centipede
      const body = pipe(
        reduce((agg, xx) => agg.concat(xx.body), []),
        /*
        inspect(
          map((b) => b.type),
          "pre-sort"
        ),
        */
        (z) => {
          const y = [].concat(z)
          y.sort((a, b) => {
            const [rA, rB] = [a, b].map(isReturnStatement)
            if (rA && !rB) return 1
            if (!rA && rB) return -1
            return 0
          })
          let ii = 0
          let found = false
          while (ii < y.length && !found) {
            ++ii
            if (isReturnStatement(y[ii])) found = true
          }
          const returns = y.slice(ii, Infinity).map(prop("argument"))
          return y
            .slice(0, ii)
            .concat([j.returnStatement(j.arrayExpression(returns))])
        },
        inspect(
          map((b) => b.type),
          "output"
        )
      )(bodies)
      return makeFunction(name, params, j.blockStatement(body))
    },
    (z) => j(z).toSource()
  )(news)
}
