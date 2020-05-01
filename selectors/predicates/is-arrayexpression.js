import {pathEq} from 'ramda'

export const SELECTOR = ["parentPath", "value", "init", "type"]

const isLiteralArray = pathEq(SELECTOR, "ArrayExpression")

export const PREDICATE = isLiteralArray

export default isLiteralArray
