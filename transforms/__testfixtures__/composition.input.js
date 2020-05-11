const twice = x => x * 2
const half = x => x / 2
const increment = x => x + 1

export const example1 = (input) => {
  const a = twice(input)
  const b = half(a)
  const out = increment(b)
  return out
}

export const example2 = (input) => {
  return increment(half(twice(input)))
}
