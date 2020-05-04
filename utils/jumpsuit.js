const C = Object.freeze({
  $: "@@FUTILITY::constant.magic",
  UNMATCHED: "@@FUTILITY::constant.unmatched"
})
const { $, UNMATCHED } = C
const isUnmatched = (x) => x === UNMATCHED
const mash = (a, b) => Object.assign({}, a, b)

const last = (x) => x[x.length - 1]
const smooth = (x) => x.filter((y) => y)
const concat = (a, b) => a.concat(b)
const identity = (y) => y
const memoizeWith = (memoizer) => (fn) => {
  const saved = {}
  const memoized = (...args) => {
    const mem = memoizer(args)
    if (mem && saved[mem]) return saved[mem]
    saved[mem] = fn(...args)
    return saved[mem]
  }
  return memoized
}

const defaultMemoizer = ([x, y]) => x.concat(y).join("-")

export const makeTypechecker = (typecheck, memo = defaultMemoizer) =>
  memoizeWith(memo)((expected, given) => {
    if (!Array.isArray(expected) || !Array.isArray(expected)) {
      throw new TypeError(
        "makeTypechecker needs two valid lists of types to run"
      )
    }
    const returnType = expected[expected.length - 1]
    const params = expected.slice(0, expected.length - 1)

    const results = params
      .slice(0, given.length)
      .map((ex, ii) => {
        const actual = typecheck(given[ii])
        return {
          idx: ii,
          raw: Object.freeze({ value: given[ii] }),
          actual,
          expected: ex,
          success: actual === ex
        }
      })
      .reduce(
        (outcome, ent) => {
          const key = ent.success ? "valid" : "invalid"

          const partial = mash(outcome, {
            [key]: concat(outcome[key], [ent]),
            rawParams: concat(outcome.rawParams, [ent])
          })
          return mash(partial, {
            failures: outcome.failures || partial.invalid.length > 0
          })
        },
        {
          rawParams: [],
          invalid: [],
          valid: [],
          signature: expected.join(" -> "),
          params,
          returnType,
          given
        }
      )
    return results
  })

const typeSystem = (z) => {
  const tt = typeof z
  return tt
}
const checkTypesValid = (checker) => (a, b) =>
  !makeTypechecker(checker)(a, b).failures
const checkReturnTypeValid = (checker) => (given) => (a, b) =>
  checker(given) === makeTypechecker(checker)(a, b).returnType

const makeParamMerger = (taste) => (aa, bb) =>
  aa.map((yy) => (taste(yy) && bb[0] ? bb.shift() : yy)).concat(bb)
const testCurryGaps = (taste) => (args) =>
  args.reduce((pp, x) => (taste(x) ? pp : pp + 1), 0)
const some = (fn) => (x) => x.some(fn)

const toString = (fn, args = []) => () =>
  `curry(${fn.name})${args.length > 0 ? `(${args.join(`,`)})` : ``}`

const hmError = (name, actual, params) =>
  `Given ${name}( ${
    actual && actual.join(", ")
  } ) but expected ${name}( ${params.slice(0, actual.length).join(", ")} )`

const grimoire = (test) => ({ ts = typeSystem, n: givenLength, hm, check }) => (
  fn
) => {
  const heat = testCurryGaps(test)
  const mergeParams = makeParamMerger(test)
  const isSpicy = some(test)
  let tChecker = false
  function curried(...args) {
    if (check && !checkTypesValid(ts)(hm, args)) {
      tChecker = makeTypechecker(ts)(hm, args)
      const { rawParams, params } = tChecker
      throw new TypeError(
        hmError(
          fn.name,
          rawParams.map((z) => z.actual),
          params
        )
      )
    }
    const nArgs =
      hm && Array.isArray(hm)
        ? hm.length - 1
        : givenLength && typeof givenLength === "number"
        ? givenLength
        : fn.length
    const length = isSpicy(args) ? heat(args) : args.length
    function saucy(...args2) {
      return curried.apply(this, mergeParams(args, args2))
    }
    saucy.toString = toString(fn, args)
    if (length >= nArgs) {
      const result = fn.apply(this, args)
      if (check) {
        if (!checkReturnTypeValid(ts)(result)(hm, args)) {
          tChecker = tChecker || makeTypechecker(ts)(hm, args)
          const { returnType } = tChecker
          throw new TypeError(
            `Expected ${
              fn.name
            } to return ${returnType} but got ${typeof result}.`
          )
        }
      }
      return result
    }
    return saucy
  }
  curried.toString = toString(fn)
  return curried
}
const PLACEHOLDER = (x) => x === $
const def = grimoire(PLACEHOLDER)
const curry = def({ n: false, check: false })
const curryN = curry((nn, fn) => def({ n: nn, check: false })(fn))
const any = curry((fn, xx) => xx.some(fn))

const isType = curry((exp, xx) => typeof xx === exp)
const [
  isString,
  isNumber,
  isUndefined,
  isFunction,
  isBoolean,
  isSymbol,
  isObject
] = [
  "string",
  "number",
  "undefined",
  "function",
  "boolean",
  "symbol",
  "object"
].map(isType)

const F = {
  isString,
  isNumber,
  isUndefined,
  isFunction,
  isBoolean,
  isSymbol,
  isObject,
  toString,
  // CORE
  $,
  __: $,
  def,
  curry,
  curryN,
  pipe: (...fns) => (x) => fns.reduce((prev, fn) => fn(prev), x),
  memoizeWith,
  keys: Object.keys,
  concat: curry(concat),
  map: curry((fn, xx) => xx.map(fn)),
  filter: curry((fn, xx) => xx.filter(fn)),
  reject: curry((fn, xx) => xx.filter((yy) => !fn(yy))),
  reduce: curry((fn, init, xx) => xx.reduce(fn, init)),
  some: any, // alias: any
  toPairs: (oo) => Object.keys(oo).map((k) => [k, oo[k]]),
  fromPairs: (ps) => ps.reduce((oo, [ke, va]) => mash(oo, { [ke]: va }), {}),
  range: curry((aa, zz) => {
    const out = []
    const down = zz < aa
    for (let ix = aa; down ? ix >= zz : ix <= zz; down ? ix-- : ix++) {
      out.push(ix)
    }
    return out
  }),
  // STRING
  toUpper: (z) => z.toUpperCase(),
  toLower: (z) => z.toLowerCase(),
  // ITERABLE
  last,
  nth: curry((ix, xx) =>
    ix < 0 && xx.length + ix ? xx[xx.length + ix] : xx[ix]
  ),
  slice: curry((aa, bb, xx) => xx.slice(aa, bb)),
  // LOGIC
  not: (yy) => !yy,
  complement: (fn) => (...x) => !fn(...x),
  both: curry((aPred, bPred, x) => aPred(x) && bPred(x)),
  and: curry((a, b) => a && b),
  equals: curry((a, b) => a === b),
  or: curry((a, b) => a || b),
  either: curry((aPred, bPred, x) => aPred(x) || bPred(x)),
  // ARITHMETIC
  // - likely flipped from ramda?
  add: curry((b, a) => a + b),
  subtract: curry((b, a) => a - b),
  divide: curry((b, a) => a / b),
  multiply: curry((b, a) => a * b),
  // COMBINATORY LOGIC
  identity,
  always: (kk) => () => kk,
  flip: (fn) => curry((a, b) => fn(b, a))
}
F.uniq = F.reduce((agg, xx) => (!agg.includes(xx) ? agg.concat(xx) : agg), [])

// PREDICATES
F.anyPass = curry((preds, xx) =>
  F.pipe(F.map(F.flip(F.some)(xx)), F.smooth, (z) => z.length > 0)(preds)
)

// ACCESSORS
F.pathOr = curry((dd, ks, src) =>
  F.reduce((agg, st) => (agg && agg[st]) || dd, src, ks)
)
const deriveFromAccessor = (acc) => ({
  unsafe: acc(null),
  eq: curry((ks, ex, src) => F.pipe(acc(UNMATCHED, ks), F.equals(ex))(src)),
  satisfies: curry((fn, ks, src) =>
    F.pipe(acc(UNMATCHED, ks), fn, Boolean)(src)
  )
})
const {
  unsafe: path,
  eq: pathEq,
  satisfies: pathSatisfies
} = deriveFromAccessor(F.pathOr)
F.path = path
F.pathEq = pathEq
F.pathSatisfies = pathSatisfies

F.propOr = curry((dd, key, source) => F.pathOr(dd, [key], source))
const {
  unsafe: prop,
  eq: propEq,
  satisfies: propSatisfies
} = deriveFromAccessor(F.propOr)
F.prop = prop
F.propEq = propEq
F.propSatisfies = propSatisfies

// not in ramda
F.smooth = smooth
F.freeze = Object.freeze
F.box = (z) => [z]
// in xtrace
F.sideEffect = curry((fn, a) => {
  fn(a)
  return a
})
F.sideEffect2 = curry((fn, a, b) => {
  fn(a, b)
  return b
})
F.trace = F.sideEffect2(console.log)

// aliases
F.I = identity
F.K = F.always
F.constant = F.K
F.any = F.some

export const FUTILITY = F.freeze(F)
export default FUTILITY
