const C = Object.freeze({ $: "@@scovilles", NIL: "@@NIL@@" })
const { $, NIL } = C

const addSpice = (taste) => (aa, bb) =>
  aa.map((yy) => (taste(yy) && bb[0] ? bb.shift() : yy)).concat(bb)
const testSpice = (taste) => (args) =>
  args.reduce((pp, x) => (taste(x) ? pp : pp + 1), 0)
const some = (fn) => (x) => x.some(fn)

const toString = (fn, args = []) => () =>
  `curry(${fn.toString()})${args.length > 0 ? `(${args.join(`,`)})` : ``}`

const curryPowder = (test) => (fn) => {
  const heat = testSpice(test)
  const mergeParams = addSpice(test)
  const isSpicy = some(test)
  function curried(...args) {
    const length = isSpicy(args) ? heat(args) : args.length
    function saucy(...args2) {
      return curried.apply(this, mergeParams(args, args2))
    }
    saucy.toString = toString(fn, args)
    return length >= fn.length ? fn.apply(this, args) : saucy
  }
  curried.toString = toString(fn)
  return curried
}
const TEST_FOR_CURRY_POWDER = (x) => x === $
const curry = curryPowder(TEST_FOR_CURRY_POWDER)
const J = {
  // CORE
  $,
  __: $,
  curry,
  pipe: (...fns) => (x) => fns.reduce((prev, fn) => fn(prev), x),
  // NATIVE
  keys: Object.keys,
  concat: curry((a, b) => a.concat(b)),
  map: curry((fn, xx) => xx.map(fn)),
  filter: curry((fn, xx) => xx.filter(fn)),
  reduce: curry((fn, init, xx) => xx.reduce(fn, init)),
  some: curry((fn, xx) => xx.some(fn)), // alias: any
  // STRING
  toUpper: (z) => z.toUpperCase(),
  toLower: (z) => z.toLowerCase(),
  // LOGIC
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
  times: curry((b, a) => a * b),
  // COMBINATORY LOGIC
  identity: (x) => x,
  always: (kk) => () => kk,
  flip: (fn) => curry((a, b) => fn(b, a))
}

// ACCESSORS
J.anyPass = curry((preds, xx) =>
  J.pipe(
    J.map(J.flip(J.some)(xx)), //(tt) => J.some(tt)(xx)),
    J.filter(J.I),
    (z) => z.length > 0
  )(preds)
)

J.pathOr = curry((def, keys, source) =>
  J.reduce((agg, step) => (agg && agg[step]) || def, source, keys)
)
J.path = J.pathOr(null)
J.pathEq = curry((ks, ex, src) => J.pipe(J.pathOr(NIL, ks), J.equals(ex))(src))
J.pathSatisfies = curry((fn, keys, source) =>
  J.pipe(J.path(keys), fn, Boolean)(source)
)

// not in ramda
J.freeze = Object.freeze
J.box = (z) => [z]
// in xtrace
J.sideEffect = curry((fn, a) => {
  fn(a)
  return a
})
J.sideEffect2 = curry((fn, a, b) => {
  fn(a, b)
  return b
})
J.trace = J.sideEffect2(console.log)

// aliases
J.I = J.identity
J.K = J.always
J.constant = J.K
J.some = J.any

// const JUMPSUIT = J.freeze(J)
export const JUMPSUIT = J.freeze(J)
export default JUMPSUIT
