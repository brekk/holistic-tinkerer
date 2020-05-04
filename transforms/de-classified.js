import { pipe, map, uniq, pathSatisfies, path, pathEq, pathOr } from "ramda"
import getMethodBody from "../tools/ast/accessors/get-method-body"
import getMethodName from "../tools/ast/accessors/get-method-name"
import getMethodParams from "../tools/ast/accessors/get-method-params"
import getClassName from "../tools/ast/accessors/get-class-name"
import isThisBound from "../tools/ast/predicates/is-bound-to-this"
import isMethodInvocation from "../tools/ast/predicates/is-callexpression"
import isSuperInvocation from "../tools/ast/predicates/is-super-invocation"

export default function transformer(file, api) {
  const jjj = api.jscodeshift
  const state = {}
  const funcs = []

  const thisBoundMethods = []
  jjj(file.source)
    .find(jjj.Identifier)
    .filter((z) => {
      return isThisBound(z) && isMethodInvocation(z)
    })
    .forEach((z) => thisBoundMethods.push(z))
  const boundMethodNames = pipe(
    map(path(["value", "name"])),
    uniq
  )(thisBoundMethods)
  console.log("boundMethodNames!\n\n - " + boundMethodNames.join("\n - "))
  /*
  const altered = jjj(file.source)
    .find(jjj.MemberExpression)
    .filter(pathEq(["value", "object", "type"], "ThisExpression"))
    .replaceWith((z) => jjj.identifier(path(["value", "property", "name"], z)))
  */
  jjj(file.source)
    .find(jjj.MethodDefinition)
    .forEach((z) => {
      const methodName = getMethodName(z)
      const body = getMethodBody(z)
      if (methodName && body) {
        const found = []
        body.body.filter((zz) => {
          const callee = pathOr(false, ["argument", "callee"], zz)
          if (callee) {
            if (
              pathEq(["object", "type"], "ThisExpression", callee) &&
              callee.property.name &&
              boundMethodNames.includes(callee.property.name)
            ) {
              found.push([callee.property.name, callee])
            }
          }
          const isThis = pathEq(
            ["expression", "callee", "object", "type"],
            "ThisExpression"
          )
          const isMatching = pathSatisfies(
            (zzz) => boundMethodNames.includes(zzz),
            ["expression", "callee", "property", "name"]
          )
          if (isThis(zz) && isMatching(zz)) {
            found.push([
              zz.expression.callee.property.name,
              zz.expression.callee
            ])
          }
        })
        console.log(
          "found?",
          found.map((nn) => nn[0])
        )
      }
      if (methodName === "constructor") {
        state[z.parent.parent.value.id.name + "Constructor"] = [
          getMethodParams(z),
          body
        ]
      }
    })
    .forEach((x) => {
      const methodName = getMethodName(x)
      const className = getClassName(x)
      const name = methodName.replace("render", className)
      const isRender = methodName === "render"
      const hasConstructor = state[className + "Constructor"]
      const params = getMethodParams(x)
      const body = getMethodBody(x)
      const bods = [hasConstructor[1], body]
      const newBody = bods
        .map(path(["body"]))
        .reduce((agg, xx) => agg.concat(xx), [])
        .filter((z) => !isSuperInvocation(z))
      const funcBody = jjj.arrowFunctionExpression(
        params,
        isRender && hasConstructor ? jjj.blockStatement(newBody) : body
      )

      const newName = jjj.identifier(isRender ? className : name)
      if (name === "constructor") return
      funcs.push(
        jjj.variableDeclaration("const", [
          jjj.variableDeclarator(newName, funcBody)
        ])
      )
    })
  return funcs.map((zz) => jjj(zz).toSource()).join("\n\n")
}
