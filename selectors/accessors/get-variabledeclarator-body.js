import {pathOr, __ as $} from 'ramda'

export const SELECTOR = ["parent", "value", "init", "body"]

const getVariableDeclaratorBodyOr = pathOr($, SELECTOR)

export const OR = false
const getVariableDeclaratorBody = getVariableDeclaratorBodyOr(OR)

export const ACCESSOR = getVariableDeclaratorBody

export default ACCESSOR 
