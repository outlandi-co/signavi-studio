import { describe, expect, it } from "vitest"
import {
  getCustomizationKey,
  matchesCustomizationSelection,
  totalMatchingPhysicalQuantity
} from "./cartCustomization"

const flower = {
  productId: "p1",
  productType: "physical",
  quantity: 2,
  selectedVariant: null,
  customization: {
    artwork: "https://example.com/flower.png",
    productionType: "screenprint",
    printLocation: "front",
    design: { x: 150, y: 150, size: 120 }
  }
}

const mountain = {
  ...flower,
  quantity: 3,
  customization: {
    ...flower.customization,
    artwork: "https://example.com/mountain.png"
  }
}

describe("customized cart selection", () => {
  it("distinguishes artwork", () => {
    expect(getCustomizationKey(flower))
      .not.toBe(getCustomizationKey(mountain))
  })

  it("selects only the correct design", () => {
    const selector = {
      customizationKey: getCustomizationKey(flower)
    }

    expect(matchesCustomizationSelection(flower, selector)).toBe(true)
    expect(matchesCustomizationSelection(mountain, selector)).toBe(false)
  })

  it("does not select customized items as ordinary items", () => {
    expect(matchesCustomizationSelection(flower, null)).toBe(false)
    expect(matchesCustomizationSelection({ productId: "p1" }, null))
      .toBe(true)
  })

  it("counts inventory across separate artworks", () => {
    expect(totalMatchingPhysicalQuantity(
      [flower, mountain], "p1", null
    )).toBe(5)
  })

  it("separates inventory by variant", () => {
    const red = {
      ...flower,
      selectedVariant: { color: "red", size: "M" }
    }
    expect(totalMatchingPhysicalQuantity(
      [flower, red], "p1", { color: "red", size: "M" }
    )).toBe(2)
  })
})
