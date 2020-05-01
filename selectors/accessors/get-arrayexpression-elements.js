import {pathOr, __ as $} from 'ramda'

export const SELECTOR = ["parentPath", "value", "init", "elements"]

const getArrayExpressionElementsOr = pathOr($, SELECTOR)

export const OR = false
const getArrayExpressionElements = getArrayExpressionElementsOr(OR)

export const ACCESSOR = getArrayExpressionElements

export default ACCESSOR 
