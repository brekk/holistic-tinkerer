import { both, pathEq } from "ramda"
import { AST } from "../../constants"
const { CallExpression: $CallExp, Super } = AST

export const SELECTORS = [
  ["expression", "type"],
  ["expression", "callee", "type"]
]

const isSuperInvocation = both(
  pathEq(SELECTORS[0], $CallExp),
  pathEq(SELECTORS[1], Super)
)

export const PREDICATE = isSuperInvocation

export default PREDICATE
