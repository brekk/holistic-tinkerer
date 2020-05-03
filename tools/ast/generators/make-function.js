import { curry } from "ramda"
const makeFunction = curry((j, name, params, body) => {
  const func = j.arrowFunctionExpression(params, body)
  return j.variableDeclaration("const", [
    j.variableDeclarator(j.identifier(name), func)
  ])
})
export default makeFunction
