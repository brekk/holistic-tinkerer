import { pathEq } from "ramda"
import { AST } from "../../constants"

const { ThisExpression: $ThisExp } = AST

export const SELECTOR = ["parent", "value", "object", "type"]

const isThisBound = pathEq(SELECTOR, $ThisExp)

export const PREDICATE = isThisBound
export default PREDICATE
