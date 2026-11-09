import { beforeEach, describe, expect, it } from "vitest"

import {
  getStorefrontCheckoutAttempt,
  storefrontCheckoutHeaders
} from "./storefrontCheckoutAttempt.js"

const originalPayload = () => ({
  storefront: "signavi_studio",
  customerName: "Test Customer",
  email: "test@example.invalid",
  items: [{
    productId: "507f1f77bcf86cd799439011",
    quantity: 1
  }],
  shippingQuote: "signed-test-quote",
  source: "cart_drawer",
  status: "payment_required"
})

describe("Studio storefront checkout attempt lifecycle", () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it("generates secure credentials for a new purchase", async () => {
    const attempt =
      await getStorefrontCheckoutAttempt(originalPayload())

    expect(attempt.attemptKey).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )

    expect(attempt.recoverySecret).toMatch(
      /^[A-Za-z0-9_-]{43}$/
    )

    expect(attempt.recoverySecret).not.toBe(attempt.attemptKey)
  })

  it("reuses credentials for an identical checkout", async () => {
    const first =
      await getStorefrontCheckoutAttempt(originalPayload())

    const second =
      await getStorefrontCheckoutAttempt(originalPayload())

    expect(second).toEqual(first)
  })

  it("reuses credentials for equivalent JSON payloads", async () => {
    const first =
      await getStorefrontCheckoutAttempt(originalPayload())

    const equivalent = JSON.parse(
      JSON.stringify(originalPayload())
    )

    const second =
      await getStorefrontCheckoutAttempt(equivalent)

    expect(second).toEqual(first)
  })

  it("rejects changed quantities without replacing credentials", async () => {
    const first =
      await getStorefrontCheckoutAttempt(originalPayload())

    const changed = originalPayload()
    changed.items[0].quantity = 2

    await expect(
      getStorefrontCheckoutAttempt(changed)
    ).rejects.toThrow(/checkout details changed/i)

    const restored =
      await getStorefrontCheckoutAttempt(originalPayload())

    expect(restored).toEqual(first)
  })

  it("rejects a changed shipping quote", async () => {
    await getStorefrontCheckoutAttempt(originalPayload())

    const changed = originalPayload()
    changed.shippingQuote = "different-quote"

    await expect(
      getStorefrontCheckoutAttempt(changed)
    ).rejects.toThrow(/checkout details changed/i)
  })

  it("rejects a changed storefront channel", async () => {
    await getStorefrontCheckoutAttempt(originalPayload())

    const changed = originalPayload()
    changed.storefront = "signavi_store"

    await expect(
      getStorefrontCheckoutAttempt(changed)
    ).rejects.toThrow(/checkout details changed/i)
  })

  it("rejects corrupted stored credentials", async () => {
    await getStorefrontCheckoutAttempt(originalPayload())

    const matchingEntry = Object.entries(sessionStorage)
      .find(([, value]) => {
        try {
          const parsed = JSON.parse(value)
          return Boolean(parsed?.attemptKey && parsed?.recoverySecret)
        } catch {
          return false
        }
      })

    expect(matchingEntry).toBeDefined()

    const [key] = matchingEntry

    sessionStorage.setItem(key, "{invalid-json")

    await expect(
      getStorefrontCheckoutAttempt(originalPayload())
    ).rejects.toThrow(/cannot be verified/i)
  })

  it("sends the exact generated credentials as request headers", async () => {
    const attempt =
      await getStorefrontCheckoutAttempt(originalPayload())

    expect(storefrontCheckoutHeaders(attempt)).toEqual({
      "x-signavi-storefront-attempt-key": attempt.attemptKey,
      "x-signavi-storefront-recovery-secret":
        attempt.recoverySecret
    })
  })

  it("rejects missing attempt credentials", () => {
    expect(() =>
      storefrontCheckoutHeaders({})
    ).toThrow(/credentials are missing/i)
  })

  it("creates a different attempt after session reset", async () => {
    const first =
      await getStorefrontCheckoutAttempt(originalPayload())

    sessionStorage.clear()

    const second =
      await getStorefrontCheckoutAttempt(originalPayload())

    expect(second.attemptKey).not.toBe(first.attemptKey)
    expect(second.recoverySecret).not.toBe(first.recoverySecret)
  })
})