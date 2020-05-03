import {pathOr, __ as $} from 'ramda'

export const SELECTOR = ["parentPath", "value", "value", "elements"]

const getArrayPropertyElementsOr = pathOr($, SELECTOR)

export const OR = false
const getArrayPropertyElements = getArrayPropertyElementsOr(OR)

export const ACCESSOR = getArrayPropertyElements

export default ACCESSOR 
