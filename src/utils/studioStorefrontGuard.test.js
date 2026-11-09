import { describe, expect, it } from "vitest"
import {
  isStudioProduct,
  isStudioCheckoutCart
} from "./studioStorefrontGuard"

describe("Studio storefront Cart isolation", () => {
  const studio = {
    productId: "507f1f77bcf86cd799439011",
    storefront: "signavi_studio"
  }

  it("accepts verified Studio channel labels", () => {
    expect(isStudioProduct(studio)).toBe(true)
  })

  it("rejects Store products", () => {
    expect(isStudioProduct({
      ...studio,
      storefront: "signavi_store"
    })).toBe(false)
  })

  it("rejects untagged legacy products", () => {
    expect(isStudioProduct({ productId: studio.productId })).toBe(false)
  })

  it("rejects missing or malformed products", () => {
    expect(isStudioProduct(null)).toBe(false)
    expect(isStudioProduct([])).toBe(false)
  })

  it("accepts plain and customized Studio items together", () => {
    expect(isStudioCheckoutCart([
      studio,
      {
        ...studio,
        customization: {
          artwork: "https://example.com/design.png"
        }
      }
    ])).toBe(true)
  })

  it("rejects mixed Store and Studio carts", () => {
    expect(isStudioCheckoutCart([
      studio,
      { ...studio, storefront: "signavi_store" }
    ])).toBe(false)
  })

  it("rejects legacy carts and empty carts", () => {
    expect(isStudioCheckoutCart([
      studio,
      { productId: "507f1f77bcf86cd799439012" }
    ])).toBe(false)

    expect(isStudioCheckoutCart([])).toBe(false)
    expect(isStudioCheckoutCart(null)).toBe(false)
  })
})
