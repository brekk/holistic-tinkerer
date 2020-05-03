import { pathEq } from "ramda"
import { AST } from "../../constants"
const { ArrayExpression: $ArrayExp } = AST

export const SELECTOR = ["parentPath", "value", "init", "type"]

const isLiteralArray = pathEq(SELECTOR, $ArrayExp)

export const PREDICATE = isLiteralArray

export default PREDICATE
