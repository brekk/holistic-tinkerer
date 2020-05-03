import {pathOr, __ as $} from 'ramda'

export const SELECTOR = ['parent', 'parent', 'value', 'id', 'name']

const getClassNameOr = pathOr($, SELECTOR)

export const OR = false
const getClassName = getClassNameOr(OR)

export const ACCESSOR = getClassName

export default ACCESSOR 
