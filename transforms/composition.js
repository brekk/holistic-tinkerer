import {
  keys,
  both,
  pathSatisfies,
  curry,
  map,
  omit,
  mergeRight,
  path,
  either,
  propEq,
  pathEq,
  pathOr
} from "ramda"
const j2 = (x) => JSON.stringify(x, null, 2)

export default function transformer(file, api) {
  const jjj = api.jscodeshift
  const fns = {}
  const calls = {}

  const walkUp = (z, trail, debugIt = false) => {
    const UNFOUND = "^UNFOUND$"
    const steps = ["parent"].concat(trail)
    const input = pathOr(UNFOUND, steps, z)
    if (input === UNFOUND) return debugIt ? trail : path(trail, z)
    return walkUp(z, steps)
  }

  const matches = curry((fn, zz) => jjj(zz).getVariableDeclarators(fn))
  const out = jjj(file.source)
    .find(
      jjj.Node,
      either(
        propEq("type", "FunctionDeclaration"),
        propEq("type", "ArrowFunctionExpression")
      )
    )
    .forEach((z) => {
      if (pathEq(["parentPath", "value", "type"], "VariableDeclarator", z)) {
        fns[path(["parentPath", "value", "id", "name"], z)] = { raw: z.value }
      }
      if (pathOr(false, ["node", "id", "name"], z)) {
        fns[z.node.id.name] = { raw: z.value }
      }
    })
    .toSource()
  const functions = keys(fns)
  console.log("FUNCTIONS!", functions)
  const valuesUsedInParams = {}
  const assignments = {}
  jjj(file.source)
    .find(jjj.CallExpression)
    .forEach((z) => {
      const inFunction = pathOr(
        false,
        [
          "parent",
          "parent",
          "parent",
          "parent",
          "parent",
          "value",
          "id",
          "name"
        ],
        z
      )
      const assignee = walkUp(z, ["value", "id", "name"])
      const name = pathOr(false, ["node", "callee", "name"], z)
      if (name && inFunction) {
        console.log(">>> ASS", assignee)
        // calls[name] = z
        const current = fns[inFunction]
        fns[inFunction] = mergeRight(current, {
          assignees: assignee
            ? mergeRight(current.assignees || {}, {
                [assignee]: name
              })
            : current.assignees || {},
          calls: (current.calls || []).concat(name)
        })
      }
    })
  jjj(file.source)
    .find(jjj.Identifier)
    .forEach((z) => {
      const inFunction = pathOr(
        false,
        [
          "parent",
          "parent",
          "parent",
          "parent",
          "parent",
          "parent",
          "value",
          "id",
          "name"
        ],
        z
      )
      const caller = pathOr(
        false,
        ["parent", "parent", "value", "init", "callee", "name"],
        z
      )
      if (
        pathOr(false, ["parent", "value"], z) &&
        !functions.includes(z.node.name)
      ) {
        if (pathEq(["parent", "value", "type"], "CallExpression", z)) {
          // valuesUsedInParams[z.node.name] = z
          if (inFunction) {
            console.log(caller, "called with", z.node.name)
            const current = fns[inFunction]
            fns[inFunction] = mergeRight(current, {
              consumers: mergeRight(current.consumers || {}, {
                [z.node.name]: caller
              })
            })
          }
        } else if (
          both(
            pathEq(["parent", "value", "type"], "VariableDeclarator"),
            pathSatisfies((tt) => tt !== "ArrowFunctionExpression", [
              "parent",
              "value",
              "init",
              "type"
            ])
          )(z)
        ) {
          assignments[z.node.name] = z
        }
      }
    })
  console.log(
    "FNS",
    j2(map(omit(["raw"]), fns))
    // assignments,
    // valuesUsedInParams
  )
  return out
}
