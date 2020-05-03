import { either } from "ramda"
import A from "./get-arrayexpression-elements"
import B from "./get-property-type-arrayexpression-elements"

export default either(A, B)
