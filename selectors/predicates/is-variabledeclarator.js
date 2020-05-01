import {pathEq} from 'ramda'

export const SELECTOR = ["parent", "value", "type"]

const isVariableDeclarator = pathEq(SELECTOR, "VariableDeclarator")

export const PREDICATE = isVariableDeclarator

export default isVariableDeclarator
