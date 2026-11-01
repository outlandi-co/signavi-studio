import { describe, expect, it, vi } from "vitest"
import {
  isApprovedSquareCheckoutUrl,
  redirectToCheckoutPayment,
  navigateToCheckoutConfirmation
} from "./checkoutNavigation"

describe("Square checkout navigation security", () => {
  it("accepts a documented Square payment short link", () => {
    expect(
      isApprovedSquareCheckoutUrl(
        "https://square.link/u/synthetic"
      )
    ).toBe(true)
  })

  it("accepts the documented Square checkout host", () => {
    expect(
      isApprovedSquareCheckoutUrl(
        "https://checkout.square.site/synthetic"
      )
    ).toBe(true)
  })

  it("rejects arbitrary HTTPS hosts", () => {
    expect(
      isApprovedSquareCheckoutUrl(
        "https://example.invalid/payment"
      )
    ).toBe(false)
  })

  it("rejects deceptive Square-lookalike domains", () => {
    expect(
      isApprovedSquareCheckoutUrl(
        "https://square.link.evil.example/u/test"
      )
    ).toBe(false)
  })

  it("rejects unapproved subdomains", () => {
    expect(
      isApprovedSquareCheckoutUrl(
        "https://fake.square.link/u/test"
      )
    ).toBe(false)
  })

  it("rejects HTTP checkout links", () => {
    expect(
      isApprovedSquareCheckoutUrl(
        "http://square.link/u/test"
      )
    ).toBe(false)
  })

  it("rejects embedded credentials", () => {
    expect(
      isApprovedSquareCheckoutUrl(
        "https://user:password@square.link/u/test"
      )
    ).toBe(false)
  })

  it("rejects malformed URLs", () => {
    expect(
      isApprovedSquareCheckoutUrl(
        "not-a-payment-url"
      )
    ).toBe(false)
  })

  it("rejects unsupported Square link paths", () => {
    expect(
      isApprovedSquareCheckoutUrl(
        "https://square.link/unknown/test"
      )
    ).toBe(false)
  })

  it("blocks navigation before calling the browser for an invalid URL", () => {
    expect(() =>
      redirectToCheckoutPayment(
        "https://example.invalid/unsafe"
      )
    ).toThrow(
      "Secure Square payment URL was not returned."
    )
  })
})
describe("Checkout confirmation navigation", () => {
  it("navigates to the correct internal route", () => {
    const navigate = vi.fn()

    const path = navigateToCheckoutConfirmation(
      "synthetic-order-123",
      navigate
    )

    expect(path).toBe("/client-checkout/synthetic-order-123")

    expect(navigate).toHaveBeenCalledExactlyOnceWith(
      "/client-checkout/synthetic-order-123"
    )
  })

  it.each([
    "",
    "../admin",
    "abc/checkout",
    "abc?redirect=https://example.invalid",
    " abc ",
    null,
    undefined
  ])("rejects invalid order ID: %s", (orderId) => {
    const navigate = vi.fn()

    expect(() =>
      navigateToCheckoutConfirmation(orderId, navigate)
    ).toThrow("Invalid checkout order ID.")

    expect(navigate).not.toHaveBeenCalled()
  })

  it("rejects missing navigation callback", () => {
    expect(() =>
      navigateToCheckoutConfirmation("synthetic-order-123")
    ).toThrow("Checkout navigation is unavailable.")
  })
})
