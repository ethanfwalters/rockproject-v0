import { describe, it, expect } from "vitest"
import { StepSchema, STEPS, type Step } from "../types"

describe("StepSchema", () => {
  it("validates valid step values", () => {
    const validSteps: Step[] = ["image", "minerals", "locality", "dimensions", "review"]

    validSteps.forEach((step) => {
      const result = StepSchema.safeParse(step)
      expect(result.success).toBe(true)
    })
  })

  it("rejects invalid step values", () => {
    const result = StepSchema.safeParse("invalid-step")
    expect(result.success).toBe(false)
  })

  it("STEPS array contains all valid steps in order", () => {
    expect(STEPS).toEqual(["image", "minerals", "locality", "dimensions", "review"])
  })

  it("STEPS array has correct length", () => {
    expect(STEPS).toHaveLength(5)
  })
})
