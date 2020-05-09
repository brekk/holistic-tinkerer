import { pathEq } from "ramda"
import TYPES from "../../constants"
const { CallExpression: $CallExp } = TYPES

const SELECTOR = ["value", "expression", "type"]
const isJSXCallExpression = pathEq(SELECTOR, "CallExpression")

export const PREDICATE = isJSXCallExpression
export default PREDICATE
