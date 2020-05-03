import {pathOr, __ as $} from 'ramda'

export const SELECTOR = ["parent", "value", "init", "params"]

const getVariableDeclaratorParamsOr = pathOr($, SELECTOR)

export const OR = false
const getVariableDeclaratorParams = getVariableDeclaratorParamsOr(OR)

export const ACCESSOR = getVariableDeclaratorParams

export default ACCESSOR 
