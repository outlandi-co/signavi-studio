import { describe, expect, it, vi } from "vitest"
import {
  recoverStudioCheckoutRequest
} from "./recoverStudioCheckoutRequest.js"

const id = "507f1f77bcf86cd799439011"
const key = "123e4567-e89b-42d3-a456-426614174000"
const secret = "A".repeat(43)

function setup() {
  const originalRequest = {
    storefront: "signavi_studio",
    source: "cart_page",
    items: [{ productId: "test-item", quantity: 1 }]
  }

  const attempt = {
    attemptKey: key,
    recoverySecret: secret
  }

  const api = {
    post: vi.fn().mockResolvedValue({
      status: 200,
      data: {
        success: true,
        orderId: id,
        checkoutToken: "RECOVERED_GUEST_TOKEN"
      }
    })
  }

  function run(overrides = {}) {
    return recoverStudioCheckoutRequest({
      api,
      originalRequest,
      attempt,
      enabled: true,
      ...overrides
    })
  }

  return { api, originalRequest, attempt, run }
}

describe("Guarded Studio checkout recovery adapter", () => {
  it("is disabled by default and never calls HTTP", async () => {
    const { api, originalRequest, attempt } = setup()

    expect(await recoverStudioCheckoutRequest({
      api,
      originalRequest,
      attempt
    })).toEqual({
      recovered: false,
      reason: "unavailable"
    })

    expect(api.post).not.toHaveBeenCalled()
  })

  it("uses the exact backend recovery request contract", async () => {
    const { api, originalRequest, run } = setup()

    expect(await run()).toEqual({
      recovered: true,
      orderId: id,
      checkoutToken: "RECOVERED_GUEST_TOKEN"
    })

    expect(api.post).toHaveBeenCalledWith(
      "/orders/storefront/recover",
      { originalRequest },
      {
        headers: {
          "x-signavi-storefront-attempt-key": key,
          "x-signavi-storefront-recovery-secret": secret
        }
      }
    )

    expect(api.post).toHaveBeenCalledTimes(1)
  })

  it("rejects Signavi Store requests", async () => {
    const { api, run } = setup()

    expect(await run({
      originalRequest: { storefront: "signavi_store" }
    })).toEqual({
      recovered: false,
      reason: "invalid_request"
    })

    expect(api.post).not.toHaveBeenCalled()
  })

  it("rejects missing recovery credentials", async () => {
    const { api, run } = setup()

    expect(await run({
      attempt: { attemptKey: key }
    })).toEqual({
      recovered: false,
      reason: "invalid_request"
    })

    expect(api.post).not.toHaveBeenCalled()
  })

  it("rejects an invalid recovered order ID", async () => {
    const { api, run } = setup()

    api.post.mockResolvedValue({
      status: 200,
      data: {
        success: true,
        orderId: "invalid",
        checkoutToken: "TOKEN"
      }
    })

    expect((await run()).recovered).toBe(false)
  })

  it("rejects a response without a guest token", async () => {
    const { api, run } = setup()

    api.post.mockResolvedValue({
      status: 200,
      data: {
        success: true,
        orderId: id
      }
    })

    expect(await run()).toEqual({
      recovered: false,
      reason: "invalid_response"
    })
  })

  it.each([403, 404, 503, 409])(
    "fails closed for HTTP %s",
    async status => {
      const { api, run } = setup()

      api.post.mockRejectedValue({
        response: { status }
      })

      const result = await run()

      expect(result.recovered).toBe(false)
      expect(api.post).toHaveBeenCalledTimes(1)
    }
  )

  it("treats network failures as uncertain", async () => {
    const { api, run } = setup()

    api.post.mockRejectedValue(
      new Error("Simulated connection loss")
    )

    expect(await run()).toEqual({
      recovered: false,
      reason: "uncertain"
    })

    expect(api.post).toHaveBeenCalledTimes(1)
  })

  it("never calls the order creation endpoint", async () => {
    const { api, run } = setup()

    await run()

    expect(
      api.post.mock.calls.some(
        ([path]) => path === "/orders"
      )
    ).toBe(false)
  })
})