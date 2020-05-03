import {pathEq} from 'ramda'

export const SELECTOR = ["parentPath", "value", "value", "type"]

const isArrayProperty = pathEq(SELECTOR, "ArrayExpression")

export const PREDICATE = isArrayProperty

export default isArrayProperty
