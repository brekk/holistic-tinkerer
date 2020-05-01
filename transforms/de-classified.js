import getMethodBody from "../selectors/accessors/get-method-body"
import getMethodName from "../selectors/accessors/get-method-name"
import getMethodParams from "../selectors/accessors/get-method-params"
import getClassName from "../selectors/accessors/get-class-name"

export default function transformer(file, api) {
  const jjj = api.jscodeshift
  const state = {}
  const funcs = []
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
      const funcBody = jjj.arrowFunctionExpression(
        params,
        isRender && hasConstructor
          ? jjj.blockStatement([hasConstructor[1], body])
          : body
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
