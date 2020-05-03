import {pathOr, __ as $} from 'ramda'

export const SELECTOR = ["value", "key", "name"]

const getFunctionNameOr = pathOr($, SELECTOR)

export const OR = false
const getFunctionName = getFunctionNameOr(OR)

export const ACCESSOR = getFunctionName

export default ACCESSOR 
