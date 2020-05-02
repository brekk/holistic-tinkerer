import R from "ramda"
import J, { makeTypechecker } from "./jumpsuit"

test("methods", () => {
  const jumpsuitMethods = J.keys(J)
  expect(jumpsuitMethods).toMatchSnapshot()
  expect(R.symmetricDifference(jumpsuitMethods, R.keys(R))).toMatchSnapshot()
})
test("toPairs / fromPairs", () => {
  const input = { a: 1, b: 2, c: 3, d: 4 }
  const output = [
    ["a", 1],
    ["b", 2],
    ["c", 3],
    ["d", 4]
  ]
  expect(J.toPairs(input)).toEqual(output)
  expect(J.fromPairs(output)).toEqual(input)
})
test("toString", () => {
  function cobra(x, a, b) {
    return "venom-" + x + "-" + a + "::" + b
  }
  const out = J.toString(cobra, ["cool"])
  expect(out()).toEqual("curry(cobra)(cool)")
  expect(J.toString(cobra)()).toEqual("curry(cobra)")
  expect(J.toString(cobra, ["yeah", "so"])()).toEqual("curry(cobra)(yeah,so)")
})
test("sideEffect", (done) => {
  const x = Math.round(Math.random() * 1e3)
  const finalCall = J.sideEffect((given) => {
    expect(given).toEqual(x)
    done()
  })
  finalCall(x)
})
test("sideEffect2", (done) => {
  const x = Math.round(Math.random() * 1e3)
  const finalCall = J.sideEffect2((tag, given) => {
    expect(given).toEqual(x)
    expect(tag).toEqual("whatever")
    done()
  })
  finalCall("whatever", x)
})
test("freeze", () => {
  const frozen = J.freeze({ a: 1, b: 2, c: 3 })
  expect(() => {
    frozen.b = -1
  }).toThrow()
})
test("box", () => {
  expect(J.box("yes")).toEqual(["yes"])
})
test("pathOr and more", () => {
  const fixture = {
    a: { alpha: { anemone: { aardvark: 1000 } } },
    b: { beta: { badger: { bat: 5010 } } }
  }
  expect(J.pathOr("???", ["a", "b", "c"], fixture)).toEqual("???")
  expect(
    J.pathOr("???", ["a", "alpha", "anemone", "aardvark"], fixture)
  ).toEqual(fixture.a.alpha.anemone.aardvark)
  expect(
    J.pathEq(["a", "alpha", "anemone", "aardvark"], 1000, fixture)
  ).toBeTruthy()
  expect(
    J.pathEq(["a", "alpha", "anemone", "aardvark"], "nope", fixture)
  ).toBeFalsy()
  expect(
    J.pathSatisfies(
      (x) => x === 1000,
      ["a", "alpha", "anemone", "aardvark"],
      fixture
    )
  ).toBeTruthy()
})
test("anyPass", () => {
  const matches = J.anyPass([(x) => x > 90, (x) => x < 70])
  expect(matches([71, 79, 81, 89])).toBeFalsy()
  expect(matches([60, 71, 79, 81, 89])).toBeTruthy()
  expect(matches([71, 79, 81, 89, 95])).toBeTruthy()
})
test("smooth", () => {
  expect(J.smooth([0, 10, false, true, "a", "", -1, null, undefined])).toEqual([
    10,
    true,
    "a",
    -1
  ])
})
test("identity", () => {
  const input = Math.round(Math.random() * 1e8)
  expect(J.identity(input)).toEqual(input)
})
test("constant", () => {
  const input = Math.round(Math.random() * 1e8)
  expect(J.constant(input)()).toEqual(input)
})
test("add", () => {
  expect(J.add(123, 456)).toEqual(123 + 456)
})
test("multiply", () => {
  expect(J.multiply(123, 456)).toEqual(123 * 456)
})
test("subtract", () => {
  expect(J.subtract(123, 456)).toEqual(456 - 123)
})

test("divide", () => {
  expect(J.divide(123, 456)).toEqual(456 / 123)
})
test("uniq", () => {
  expect(J.uniq("bananasplitfiresunday".split(""))).toEqual(
    "bansplitfreudy".split("")
  )
})
test("equals", () => {
  expect(J.equals(123, 123)).toBeTruthy()
  expect(J.equals(321, 123)).toBeFalsy()
})
test("or", () => {
  expect(J.or(true, true)).toBeTruthy()
  expect(J.or(false, true)).toBeTruthy()
  expect(J.or(true, false)).toBeTruthy()
  expect(J.or(false, false)).toBeFalsy()
})
test("either", () => {
  expect(
    J.either(
      () => true,
      () => false,
      ""
    )
  ).toBeTruthy()
  expect(
    J.either(
      () => false,
      () => true,
      ""
    )
  ).toBeTruthy()
  expect(
    J.either(
      () => true,
      () => true,
      ""
    )
  ).toBeTruthy()
  expect(
    J.either(
      () => false,
      () => false,
      ""
    )
  ).toBeFalsy()
})
test("and", () => {
  expect(J.and(true, true)).toBeTruthy()
  expect(J.and(false, true)).toBeFalsy()
  expect(J.and(true, false)).toBeFalsy()
})
test("both", () => {
  expect(
    J.both(
      () => true,
      () => true
    )("")
  ).toBeTruthy()
  expect(
    J.both(
      () => false,
      () => true
    )("")
  ).toBeFalsy()
  expect(
    J.both(
      () => true,
      () => false
    )("")
  ).toBeFalsy()
})
test("not", () => {
  expect(J.not(true)).toBeFalsy()
  expect(J.not(false)).toBeTruthy()
})
test("complement", () => {
  const isEven = (x) => x % 2 === 0
  const isOdd = J.filter(J.complement(isEven))
  expect(isOdd([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])).toEqual([1, 3, 5, 7, 9])
})
test("toUpper / toLower", () => {
  expect(J.toUpper("WhAtEverman")).toEqual("WHATEVERMAN")
  expect(J.toLower("WhAtEverman")).toEqual("whateverman")
})
test("curryN", () => {
  const triple = (a, b, c) => a + b / c
  const c3 = J.curryN(3, triple)
  const ccc = c3(12, 34, 56)
  expect(ccc).toEqual(12 + 34 / 56)
  expect(c3(12)(34)(56)).toEqual(ccc)
  expect(c3(12, 34)(56)).toEqual(ccc)
  expect(c3(12)(34, 56)).toEqual(ccc)
  const c4 = J.curryN(3, (a, b) => a + b / 1)
  expect(c4(12 + 34 / 56, 0)(undefined)).toEqual(ccc)
})
test("range", () => {
  expect(J.range(0, 10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  expect(J.range(10, 0)).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0])
  expect(J.range(0, -10)).toEqual([0, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10])
  expect(J.range(-5, 5)).toEqual([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5])
})
test("curry", () => {
  const triple = (a, b, c) => a + b / c
  const c3 = J.curry(triple)
  const ccc = c3(12, 34, 56)
  expect(ccc).toEqual(12 + 34 / 56)
  expect(c3(12)(34)(56)).toEqual(ccc)
  expect(c3(12, 34)(56)).toEqual(ccc)
  expect(c3(12)(34, 56)).toEqual(ccc)
})
test("curry - placeholder", () => {
  const triple = (a, b, c) => a + b / c
  const c3 = J.curry(triple)
  const place = c3(12, J.$, 56)
  expect(place(100)).toEqual(12 + 100 / 56)
})
test("pipe", () => {
  const a = (x) => x / 10
  const b = (y) => y + 24
  const c = (z) => z - 101
  const comp = J.pipe(a, b, c)
  expect(comp(100)).toEqual(-67)
})
test("keys", () => {
  expect(J.keys({ a: 1, b: 2, c: 3 })).toEqual("abc".split(""))
})
test("concat", () => {
  expect(J.concat(["a"], "b")).toEqual("ab".split(""))
})
test("map", () => {
  expect(J.map((x) => x * x, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])).toEqual([
    0,
    1,
    4,
    9,
    16,
    25,
    36,
    49,
    64,
    81
  ])
})

test("filter / reject", () => {
  const isEven = (x) => x % 2 === 0
  const input = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  expect(J.filter(isEven, input)).toEqual([0, 2, 4, 6, 8])
  expect(J.reject(isEven, input)).toEqual([1, 3, 5, 7, 9])
})
test("reduce", () => {
  expect(
    J.reduce((agg, x) => agg + x, 0, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  ).toEqual(1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9)
})
test("some", () => {
  const even = (x) => x % 2 === 0
  const eves = J.some(even)([1, 2, 3])
  expect(eves).toBeTruthy()
  expect(J.some(even)([1, 3])).toBeFalsy()
})
test("flip", () => {
  const input = { a: 123, b: 789 }
  const expected = 123 / 789
  const expectedAfterFlip = 789 / 123
  expect(J.divide(input.b, input.a)).toEqual(expected)
  expect(J.flip(J.divide)(input.b, input.a)).toEqual(expectedAfterFlip)
})

test("def", () => {
  const abc = (a, b, c) => a + b / c
  const triple = J.def({
    check: true,
    hm: ["number", "number", "number", "number"]
  })(abc)
  expect(triple(1, 2, 3)).toEqual(1 + 2 / 3)
  expect(triple(1)(2)(3)).toEqual(1 + 2 / 3)
  expect(triple(1, 2)(3)).toEqual(1 + 2 / 3)
  expect(triple(1)(2, 3)).toEqual(1 + 2 / 3)
})
test("def - errors", () => {
  const abcz = (a, b, c, d) => a(b, c, d)
  const triplez = J.def({
    check: true,
    hm: ["function", "number", "string", "string", "boolean"]
  })(abcz)
  expect(() => triplez(() => false, 1, 1)).toThrow(
    "Given abcz( function, number, number ) but expected abcz( function, number, string )"
  )
})
test("def - return type", () => {
  const abcString = (a, b, c) => "" + (a + b) / c
  const tripleS = J.def({
    check: true,
    hm: ["number", "number", "number", "number"]
  })(abcString)
  expect(() => tripleS(1, 2, 3)).toThrow(
    "Expected abcString to return number but got string."
  )
  const tripleSCorrect = J.def({
    check: true,
    hm: ["number", "number", "number", "string"]
  })(abcString)
  expect(tripleSCorrect(1, 2, 3)).toEqual("1")
})
test("slice", () => {
  expect(J.slice(1, Infinity, "abcde".split(""))).toEqual("bcde".split(""))
})

test("makeTypechecker", () => {
  expect(() =>
    makeTypechecker(
      (z) => typeof z,
      (x) => x
    )(1, 1)
  ).toThrow("makeTypechecker needs two valid lists of types to run")
  const copy = {}
  const saver = ([a, b]) => {
    copy[a.concat(b).join("-")] = [a, b]
    return a.concat(b).join("-")
  }
  expect(
    makeTypechecker((z) => typeof z, saver)(
      ["boolean", "boolean"],
      [true, false]
    )
  ).toEqual({
    failures: false,
    given: [true, false],
    invalid: [],
    params: ["boolean"],
    returnType: "boolean",
    rawParams: [
      {
        actual: "boolean",
        expected: "boolean",
        idx: 0,
        raw: { value: true },
        success: true
      }
    ],
    signature: "boolean -> boolean",
    valid: [
      {
        actual: "boolean",
        expected: "boolean",
        idx: 0,
        raw: { value: true },
        success: true
      }
    ]
  })
  expect(copy).toEqual({
    "boolean-boolean-true-false": [
      ["boolean", "boolean"],
      [true, false]
    ]
  })
})

test("memoizeWith", () => {
  const lockbox = {}
  const triple = (a, b, c) => {
    const value = (a + b) / c
    lockbox[[a, b, c].join("-")] = value
    return value
  }
  const mTriple = J.memoizeWith(([o, t, h]) => `${o}-${t}-${h}`)(triple)
  expect(mTriple(1, 2, 3)).toEqual((1 + 2) / 3)
  expect(mTriple(2, 3, 4)).toEqual((2 + 3) / 4)
  expect(mTriple(1, 2, 3)).toEqual((1 + 2) / 3)
  expect(lockbox).toEqual({ "1-2-3": 1, "2-3-4": 5 / 4 })
})
