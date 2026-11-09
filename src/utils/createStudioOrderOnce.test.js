import { describe, expect, it, vi } from "vitest"

import {
  createStudioOrderOnce
} from "./createStudioOrderOnce.js"

const orderId = "507f1f77bcf86cd799439011"

const attempt = {
  attemptKey: "123e4567-e89b-42d3-a456-426614174000",
  recoverySecret: "A".repeat(43)
}

const payload = {
  storefront: "signavi_studio",
  source: "cart_page",
  items: [
    {
      productId: "test-product",
      quantity: 1
    }
  ]
}

function setup() {
  const api = {
    post: vi.fn().mockResolvedValue({
      status: 201,
      data: {
        success: true,
        data: { _id: orderId },
        checkoutToken: "TEST_GUEST_TOKEN"
      }
    })
  }

  const run = (overrides = {}) =>
    createStudioOrderOnce({
      api,
      orderPayload: payload,
      attempt,
      ...overrides
    })

  return { api, run }
}

describe("Single-request Studio order creation", () => {
  it("creates an order once with the original credentials", async () => {
    const { api, run } = setup()

    expect(await run()).toEqual({
      kind: "created",
      orderId,
      checkoutToken: "TEST_GUEST_TOKEN",
      canCreateAnotherOrder: false
    })

    expect(api.post).toHaveBeenCalledExactlyOnceWith(
      "/orders",
      payload,
      {
        headers: {
          "x-signavi-storefront-attempt-key":
            attempt.attemptKey,
          "x-signavi-storefront-recovery-secret":
            attempt.recoverySecret
        }
      }
    )
  })

  it("does not retry an HTTP 409 conflict", async () => {
    const { api, run } = setup()

    api.post.mockRejectedValue({
      response: { status: 409 }
    })

    const result = await run()

    expect(result.kind).toBe("uncertain")
    expect(result.reason).toBe("conflict_requires_recovery")
    expect(api.post).toHaveBeenCalledTimes(1)
  })

  it("does not retry a network failure", async () => {
    const { api, run } = setup()

    api.post.mockRejectedValue(
      new Error("Connection lost")
    )

    const result = await run()

    expect(result.kind).toBe("uncertain")
    expect(api.post).toHaveBeenCalledTimes(1)
  })

  it("does not retry a timeout", async () => {
    const { api, run } = setup()

    api.post.mockRejectedValue({
      code: "ECONNABORTED"
    })

    expect((await run()).kind).toBe("uncertain")
    expect(api.post).toHaveBeenCalledTimes(1)
  })

  it("does not accept missing guest tokens", async () => {
    const { api, run } = setup()

    api.post.mockResolvedValue({
      status: 201,
      data: {
        success: true,
        data: { _id: orderId }
      }
    })

    expect((await run()).kind).toBe("uncertain")
    expect(api.post).toHaveBeenCalledTimes(1)
  })

  it("does not accept missing order IDs", async () => {
    const { api, run } = setup()

    api.post.mockResolvedValue({
      status: 201,
      data: {
        success: true,
        checkoutToken: "TEST_GUEST_TOKEN"
      }
    })

    expect((await run()).kind).toBe("uncertain")
  })

  it("classifies a locked checkout as rejected", async () => {
    const { api, run } = setup()

    api.post.mockRejectedValue({
      response: { status: 423 }
    })

    const result = await run()

    expect(result.kind).toBe("rejected")
    expect(result.canCreateAnotherOrder).toBe(false)
    expect(api.post).toHaveBeenCalledTimes(1)
  })

  it("never sends Signavi Store orders", async () => {
    const { api, run } = setup()

    const result = await run({
      orderPayload: {
        ...payload,
        storefront: "signavi_store"
      }
    })

    expect(result.kind).toBe("rejected")
    expect(api.post).not.toHaveBeenCalled()
  })

  it("rejects missing credentials without HTTP", async () => {
    const { api, run } = setup()

    const result = await run({
      attempt: null
    })

    expect(result.kind).toBe("rejected")
    expect(api.post).not.toHaveBeenCalled()
  })

  it("never makes a recovery or payment request", async () => {
    const { api, run } = setup()

    await run()

    expect(api.post.mock.calls.map(call => call[0]))
      .toEqual(["/orders"])
  })
})