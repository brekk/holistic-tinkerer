import { curry, pathSatisfies } from "ramda"

export const SELECTOR = ["value", "expression", "callee", "name"]
const containsNamedExpression = curry((list, x) =>
  pathSatisfies(
    (z) => list.includes(z),
    ["value", "expression", "callee", "name"],
    x
  )
)

export const PREDICATE = containsNamedExpression
export default PREDICATE
