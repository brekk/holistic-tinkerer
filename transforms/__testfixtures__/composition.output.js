import { pipe } from "ramda"

const twice = (x) => x * 2
const half = (x) => x / 2
const increment = (x) => x + 1

export const example1 = pipe(twice, half, increment)

export const example2 = pipe(twice, half, increment)
