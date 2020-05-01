import { defineTest } from "jscodeshift/dist/testUtils"

export const namedTest = (xxx, dirname, desc = 'it works good') => describe(xxx, () => {
  describe(desc, () => {
    defineTest(dirname, xxx)
  })
})
