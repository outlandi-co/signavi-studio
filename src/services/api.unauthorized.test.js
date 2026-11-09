import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it
} from "vitest"

import { AxiosError } from "axios"
import api from "./api.js"

const originalAdapter = api.defaults.adapter

const ORDER_ID = "507f1f77bcf86cd799439011"
const ATTEMPT_KEY = "signavi:studio:checkout-attempt:v1"
const GUEST_KEY = `signaviCheckoutToken:${ORDER_ID}`
const QUOTE_KEY = `signaviCheckoutQuote:${ORDER_ID}`

function seedCheckout() {
  sessionStorage.setItem(ATTEMPT_KEY, "protected-attempt")
  sessionStorage.setItem(GUEST_KEY, "protected-guest-token")
  sessionStorage.setItem(QUOTE_KEY, "protected-quote")
  localStorage.setItem("lastOrderId", ORDER_ID)
}

function expectCheckoutPreserved() {
  expect(sessionStorage.getItem(ATTEMPT_KEY))
    .toBe("protected-attempt")

  expect(sessionStorage.getItem(GUEST_KEY))
    .toBe("protected-guest-token")

  expect(sessionStorage.getItem(QUOTE_KEY))
    .toBe("protected-quote")

  expect(localStorage.getItem("lastOrderId"))
    .toBe(ORDER_ID)
}

function simulateUnauthorized() {
  let calls = 0

  api.defaults.adapter = async config => {
    calls++

    throw new AxiosError(
      "Simulated unauthorized response",
      "ERR_BAD_RESPONSE",
      config,
      undefined,
      {
        data: { message: "Unauthorized" },
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config
      }
    )
  }

  return () => calls
}

describe("Signavi Studio Axios 401 session protection", () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    seedCheckout()
  })

  afterEach(() => {
    api.defaults.adapter = originalAdapter
    localStorage.clear()
    sessionStorage.clear()
  })

  it("preserves checkout storage on guest order creation 401", async () => {
    localStorage.setItem("adminToken", "admin-test-token")
    localStorage.setItem("adminUser", "admin-test-user")

    const calls = simulateUnauthorized()

    await expect(
      api.post("/orders", {
        storefront: "signavi_studio"
      })
    ).rejects.toMatchObject({
      response: { status: 401 }
    })

    expect(calls()).toBe(1)
    expectCheckoutPreserved()

    expect(localStorage.getItem("adminToken"))
      .toBe("admin-test-token")
  })

  it("does not retry guest checkout confirmation on 401", async () => {
    localStorage.setItem("customerToken", "customer-test-token")

    const calls = simulateUnauthorized()

    await expect(
      api.patch(
        `/orders/${ORDER_ID}/checkout`,
        {},
        {
          headers: {
            "x-signavi-guest-checkout-token": "guest-test-token"
          }
        }
      )
    ).rejects.toMatchObject({
      response: { status: 401 }
    })

    expect(calls()).toBe(1)
    expectCheckoutPreserved()
    expect(localStorage.getItem("customerToken"))
      .toBe("customer-test-token")
  })

  it("does not retry guest recovery on 401", async () => {
    const calls = simulateUnauthorized()

    await expect(
      api.post("/orders/storefront/recover", {
        originalRequest: {}
      })
    ).rejects.toMatchObject({
      response: { status: 401 }
    })

    expect(calls()).toBe(1)
    expectCheckoutPreserved()
  })

  it("does not clear checkout on anonymous API 401", async () => {
    const calls = simulateUnauthorized()

    await expect(
      api.get("/public/test")
    ).rejects.toMatchObject({
      response: { status: 401 }
    })

    expect(calls()).toBe(1)
    expectCheckoutPreserved()
  })

  // The Square path suppresses the legacy login redirect,
  // allowing token cleanup to be exercised in jsdom.
  it("clears an expired admin token, not checkout data", async () => {
    localStorage.setItem("adminToken", "expired-admin")
    localStorage.setItem("adminUser", "admin-profile")

    localStorage.setItem("customerToken", "valid-customer")
    localStorage.setItem("customerUser", "customer-profile")

    const calls = simulateUnauthorized()

    await expect(
      api.get("/square/test")
    ).rejects.toMatchObject({
      response: { status: 401 }
    })

    expect(calls()).toBe(2)

    expect(localStorage.getItem("adminToken")).toBe(null)
    expect(localStorage.getItem("adminUser")).toBe(null)

    expect(localStorage.getItem("customerToken"))
      .toBe("valid-customer")

    expect(localStorage.getItem("customerUser"))
      .toBe("customer-profile")

    expectCheckoutPreserved()
  })

  it("clears an expired customer token, not checkout data", async () => {
    sessionStorage.setItem("customerToken", "expired-customer")
    sessionStorage.setItem("customerUser", "customer-profile")

    const calls = simulateUnauthorized()

    await expect(
      api.get("/square/test")
    ).rejects.toMatchObject({
      response: { status: 401 }
    })

    expect(calls()).toBe(2)

    expect(sessionStorage.getItem("customerToken")).toBe(null)
    expect(sessionStorage.getItem("customerUser")).toBe(null)

    expectCheckoutPreserved()
  })

  it("preserves a newer admin login after an older request returns 401", async () => {
    localStorage.setItem("adminToken", "old-admin-token")
    localStorage.setItem("adminUser", "old-admin-profile")

    let calls = 0

    api.defaults.adapter = async config => {
      calls++

      // A newer successful login occurs before the older
      // request receives its unauthorized response.
      localStorage.setItem("adminToken", "new-admin-token")
      localStorage.setItem("adminUser", "new-admin-profile")

      throw new AxiosError(
        "Simulated stale unauthorized response",
        "ERR_BAD_RESPONSE",
        config,
        undefined,
        {
          data: { message: "Unauthorized" },
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config
        }
      )
    }

    await expect(
      api.get("/auth/profile")
    ).rejects.toMatchObject({
      response: { status: 401 }
    })

    expect(calls).toBe(1)

    expect(localStorage.getItem("adminToken"))
      .toBe("new-admin-token")

    expect(localStorage.getItem("adminUser"))
      .toBe("new-admin-profile")

    expectCheckoutPreserved()
  })
})