import { pipe, ap, pathOr } from "ramda"

export const getClassAndFunctionName = pipe(
  (z) => [z],
  ap([
    pathOr("Unknown", [
      "parent",
      "parent",
      "parent",
      "parent",
      "parent",
      "parent",
      "parent",
      "value",
      "id",
      "name"
    ]),
    pathOr("?", ["value", "expression", "callee", "name"])
  ])
)
export default getClassAndFunctionName
