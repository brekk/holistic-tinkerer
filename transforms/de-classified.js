import {
  keys,
  toLower,
  includes,
  filter,
  memoizeWith,
  curry,
  either,
  both,
  pipe,
  map,
  uniq,
  pathSatisfies,
  path,
  pathEq,
  pathOr
} from "ramda"
import getMethodBody from "../tools/ast/accessors/get-method-body"
import getMethodName from "../tools/ast/accessors/get-method-name"
import getMethodParams from "../tools/ast/accessors/get-method-params"
import getClassName from "../tools/ast/accessors/get-class-name"
import isThisBound from "../tools/ast/predicates/is-bound-to-this"
import isMethodInvocation from "../tools/ast/predicates/is-callexpression"
import isSuperInvocation from "../tools/ast/predicates/is-super-invocation"
import containsNamedExpression from "../tools/ast/predicates/contains-named-expression"
import isJSXCallExpression from "../tools/ast/predicates/is-jsx-call-expression"
import getClassAndFunctionName from "../tools/ast/accessors/get-class-from-jsx-expression"
const inJSXExpression = pathEq(
  ["parentPath", "parentPath", "value", "type"],
  "JSXExpressionContainer"
)
const includesBoundMethods = curry((bound, x) =>
  pathSatisfies((z) => bound.includes(z), [
    "parentPath",
    "value",
    "callee",
    "name"
  ])(x)
)

const isThisMemberExpression = pathEq(
  ["value", "object", "type"],
  "ThisExpression"
)

const isCallExpression = pathEq(
  ["parentPath", "value", "type"],
  "CallExpression"
)
const newFunctionName = memoizeWith((a, b) => a + b)((cn, fn) =>
  fn.replace("render", cn)
)
const getValPropName = path(["value", "property", "name"])

export default function transformer(file, api) {
  const jjj = api.jscodeshift
  const state = {}
  const outputLines = []
  const thisBoundMethods = []
  const exportedClasses = []

  const findSomeNodes = (named) =>
    pipe(keys, filter(pipe(toLower, includes(named))))(jjj)
  /*
  console.log(
    "find some nodes, bro",
    findSomeNodes("declaration"),
    jjj(file.source).find(
      jjj.ExportNamedDeclaration,
      jjj.ExportDefaultDeclaration
    )
  )*/
  // TODO: simplify "ALL NODES WHICH AREN'T CLASSES"
  jjj(file.source)
    .find(jjj.ImportDeclaration)
    .forEach((z) => outputLines.push(z))
  jjj(file.source)
    .find(jjj.ExportNamedDeclaration)
    .forEach((z) =>
      z.value.declaration.type === "ClassDeclaration"
        ? exportedClasses.push(z)
        : outputLines.push(z)
    )
  jjj(file.source)
    .find(jjj.Identifier)
    .forEach((z) => {
      if (isThisBound(z) && isMethodInvocation(z)) {
        thisBoundMethods.push(z)
      }
    })
  const boundMethodNames = pipe(
    map(path(["value", "name"])),
    uniq
  )(thisBoundMethods)
  const removedThisCalls = jjj(file.source)
    .find(jjj.MemberExpression)
    .filter(
      either(
        both(inJSXExpression, includesBoundMethods(boundMethodNames)),
        both(isThisMemberExpression, isCallExpression)
      )
    )
    .replaceWith((z) =>
      inJSXExpression(z) ? getValPropName(z) : jjj.identifier(getValPropName(z))
    )
    .toSource()
  const rewrappedJSXCalls = jjj(removedThisCalls)
    .find(jjj.JSXExpressionContainer)
    .filter(
      both(isJSXCallExpression, containsNamedExpression(boundMethodNames))
    )
    .replaceWith((z) => {
      const [className, fnName] = getClassAndFunctionName(z)
      const newName = newFunctionName(className, fnName)
      const nodeName = jjj.jsxIdentifier(newName)
      return jjj.jsxElement(
        jjj.jsxOpeningElement(nodeName),
        jjj.jsxClosingElement(nodeName),
        z.value.expression.arguments
      )
    })
    .toSource()

  jjj(rewrappedJSXCalls)
    .find(jjj.MethodDefinition)
    .forEach((z) => {
      const methodName = getMethodName(z)
      if (methodName === "constructor") {
        const body = getMethodBody(z)
        state[z.parent.parent.value.id.name + "Constructor"] = [
          getMethodParams(z),
          body
        ]
      }
    })
    .forEach((x) => {
      const methodName = getMethodName(x)
      if (methodName === "constructor") return
      const className = getClassName(x)
      const name = newFunctionName(className, methodName)
      const isRender = methodName === "render"
      const hasConstructor = state[className + "Constructor"]
      const params = getMethodParams(x)
      const body = getMethodBody(x)
      const bods = [hasConstructor[1], body]
      const newBody = bods
        .map(path(["body"]))
        .reduce((agg, xx) => agg.concat(xx), [])
        .filter((z) => !isSuperInvocation(z))

      const newName = jjj.identifier(isRender ? className : name)
      const funcBody = jjj.arrowFunctionExpression(
        params,
        isRender && hasConstructor ? jjj.blockStatement(newBody) : body
      )
      const constDeclaration = jjj.variableDeclaration("const", [
        jjj.variableDeclarator(newName, funcBody)
      ])
      const out = exportedClasses
        .map(path(["value", "declaration", "id", "name"]))
        .includes(name)
        ? jjj.exportNamedDeclaration(constDeclaration)
        : constDeclaration
      if (exportedClasses.includes(name)) console.log("SHISSHSIHSIHS", out)
      outputLines.push(out)
    })
  jjj(file.source)
    .find(jjj.ExportDefaultDeclaration)
    .forEach((z) => outputLines.push(z))
  return outputLines.map((zz) => jjj(zz).toSource()).join("\n\n")
}
