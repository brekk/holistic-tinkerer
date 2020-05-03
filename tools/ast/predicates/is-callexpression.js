import { pathEq } from "ramda"
import { AST } from "../../constants"
const { CallExpression: $CallExp } = AST

const SELECTOR = ["parent", "parent", "value", "type"]

const isMethodInvocation = pathEq(SELECTOR, $CallExp)

export const PREDICATE = isMethodInvocation
export default PREDICATE
