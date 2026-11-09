import { describe, expect, it } from "vitest"

import {
  decideUnauthorizedSession,
  isGuestCheckoutRequest
} from "./unauthorizedSessionDecision.js"

const decide = (overrides = {}) =>
  decideUnauthorizedSession({
    method: "get",
    url: "/auth/profile",
    authorization: "Bearer admin-secret",
    adminToken: "admin-secret",
    customerToken: "customer-secret",
    ...overrides
  })

describe("Signavi Studio unauthorized-session decisions", () => {
  it("identifies guest Studio order creation", () => {
    expect(
      isGuestCheckoutRequest("POST", "/orders")
    ).toBe(true)
  })

  it("identifies guest checkout confirmation", () => {
    expect(
      isGuestCheckoutRequest(
        "PATCH",
        "/api/orders/507f1f77bcf86cd799439011/checkout"
      )
    ).toBe(true)
  })

  it("identifies Studio order recovery", () => {
    expect(
      isGuestCheckoutRequest(
        "POST",
        "/api/orders/storefront/recover"
      )
    ).toBe(true)
  })

  it("does not classify administrative order updates as guest checkout", () => {
    expect(
      isGuestCheckoutRequest(
        "PATCH",
        "/orders/507f1f77bcf86cd799439011"
      )
    ).toBe(false)
  })

  it("does not invalidate login for guest order creation", () => {
    expect(decide({
      method: "post",
      url: "/orders"
    })).toEqual({
      clear: null,
      guestCheckout: true
    })
  })

  it("does not invalidate login for guest payment confirmation", () => {
    expect(decide({
      method: "patch",
      url: "/orders/507f1f77bcf86cd799439011/checkout"
    }).clear).toBe(null)
  })

  it("selects the rejected admin session", () => {
    expect(decide().clear).toBe("admin")
  })

  it("selects the rejected customer session", () => {
    expect(decide({
      authorization: "Bearer customer-secret"
    }).clear).toBe("customer")
  })

  it("does not clear sessions when no Bearer token was sent", () => {
    expect(decide({
      authorization: undefined
    }).clear).toBe(null)
  })

  it("does not clear sessions when the sent token is no longer current", () => {
    expect(decide({
      authorization: "Bearer older-token"
    }).clear).toBe(null)
  })

  it("does not clear sessions for an unknown token", () => {
    expect(decide({
      authorization: "Bearer unknown-token"
    }).clear).toBe(null)
  })
})