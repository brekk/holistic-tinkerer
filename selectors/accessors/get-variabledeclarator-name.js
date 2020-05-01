import {pathOr, __ as $} from 'ramda'

export const SELECTOR = ["value", "name"]

const getVariableDeclaratorNameOr = pathOr($, SELECTOR)

export const OR = false
const getVariableDeclaratorName = getVariableDeclaratorNameOr(OR)

export const ACCESSOR = getVariableDeclaratorName

export default ACCESSOR 
