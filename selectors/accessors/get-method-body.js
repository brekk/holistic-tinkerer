import {pathOr, __ as $} from 'ramda'

export const SELECTOR = ["value", "value", "body"]

const getMethodBodyOr = pathOr($, SELECTOR)

export const OR = false
const getMethodBody = getMethodBodyOr(OR)

export const ACCESSOR = getMethodBody

export default ACCESSOR 
