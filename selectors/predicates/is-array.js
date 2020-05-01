import {either} from 'ramda'
import A from './is-arrayexpression'
import B from './is-property-type-arrayexpression'

export default either(A, B)
