import { prop } from "ramda"
import getMethodBody from "../tools/ast/accessors/get-method-body"
import getMethodName from "../tools/ast/accessors/get-method-name"
import getMethodParams from "../tools/ast/accessors/get-method-params"
import getClassName from "../tools/ast/accessors/get-class-name"
import isThisBound from "../tools/ast/predicates/is-bound-to-this"
import isMethodInvocation from "../tools/ast/predicates/is-callexpression"

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
  console.log(
    "this.* calls :::",
    thisBoundMethods.map((z) => jjj(z).toSource()).join("\n")
  )
  jjj(file.source)
    .find(jjj.MethodDefinition)
    .forEach((z) => {
      const methodName = getMethodName(z)
      if (methodName === "constructor") {
        state[z.parent.parent.value.id.name + "Constructor"] = [
          getMethodParams(z),
          getMethodBody(z)
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
      console.log("bods", bods.map(prop("body")))
      const funcBody = jjj.arrowFunctionExpression(
        params,
        isRender && hasConstructor ? jjj.blockStatement(bods) : body
      )

      const newName = jjj.identifier(isRender ? className : name)
      if (name === "constructor") return
      funcs.push(
        jjj.variableDeclaration("const", [
          jjj.variableDeclarator(newName, funcBody)
        ])
      )
    })
    .remove()
  return funcs.map((zz) => jjj(zz).toSource()).join("\n\n")
}
