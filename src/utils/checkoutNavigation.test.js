import { describe, expect, it } from "vitest"
import {
  isApprovedSquareCheckoutUrl,
  redirectToCheckoutPayment
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