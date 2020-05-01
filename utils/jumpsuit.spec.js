import J from "./jumpsuit"

test("flip", () => {
  const input = { a: 123, b: 789 }
  const expected = 123 / 789
  const expectedAfterFlip = 789 / 123
  expect(J.divide(input.b, input.a)).toEqual(expected)
  expect(J.flip(J.divide)(input.b, input.a)).toEqual(expectedAfterFlip)
})
