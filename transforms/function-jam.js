import { prop, pipe, propEq, reduce } from "ramda"
import { camelCase } from "text-case"
import { inspect } from "xtrace"
import { AST } from "../tools/constants"
import isVD from "../tools/ast/predicates/is-variabledeclarator"
import getVDBody from "../tools/ast/accessors/get-variabledeclarator-body"
import getVDParams from "../tools/ast/accessors/get-variabledeclarator-params"
import getVDName from "../tools/ast/accessors/get-variabledeclarator-name"
import makeFunction from "../tools/ast/generators/make-function"

const { ReturnStatement: $RS } = AST

const j2 = (x) => JSON.stringify(x, null, 2)

const isReturnStatement = propEq("type", $RS)
export default function transformer(file, api) {
  const j = api.jscodeshift
  const news = []

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
      // filth
      const centipede = pipe(
        reduce((agg, xx) => agg.concat(xx.body), []),
        /*
        inspect(
          map((b) => b.type),
          "pre-sort"
        ),
        */
        (z) => {
          // sorting is in-place, so we make a copy
          const y = [].concat(z)
          // return at the end, y'all
          y.sort((a, b) => {
            const [rA, rB] = [a, b].map(isReturnStatement)
            if (rA && !rB) return 1
            if (!rA && rB) return -1
            return 0
          })
          // grab the first return statement's index
          let ii = 0
          let found = false
          while (ii < y.length && !found) {
            ++ii
            if (isReturnStatement(y[ii])) found = true
          }
          // grab the returns, hear people's arguments
          const returns = y.slice(ii, Infinity).map(prop("argument"))
          // yield profit?
          return y
            .slice(0, ii)
            .concat([j.returnStatement(j.arrayExpression(returns))])
        }
        /*
        inspect(
          map((b) => b.type),
          "output"
        )
        */
      )(bodies)
      return makeFunction(j, name, params, j.blockStatement(centipede))
    },
    (z) => j(z).toSource()
  )(news)
}
