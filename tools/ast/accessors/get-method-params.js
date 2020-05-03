import {pathOr, __ as $} from 'ramda'

export const SELECTOR = ["value", "value", "params"]

const getMethodParamsOr = pathOr($, SELECTOR)

export const OR = false
const getMethodParams = getMethodParamsOr(OR)

export const ACCESSOR = getMethodParams

export default ACCESSOR 
