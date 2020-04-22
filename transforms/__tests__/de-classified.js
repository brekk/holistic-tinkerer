import { defineTest } from "jscodeshift/dist/testUtils"
jest.autoMockOff()
describe("de-classified", () => {
  describe("Class with renderChild", () => {
    defineTest(__dirname, "de-classified")
  })
})
