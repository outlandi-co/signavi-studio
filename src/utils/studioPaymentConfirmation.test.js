import { describe, expect, it, vi } from "vitest"
import {
  fetchStudioPaymentConfirmation
} from "./studioPaymentConfirmation.js"

const id = "507f1f77bcf86cd799439011"
const key = "123e4567-e89b-42d3-a456-426614174000"
const storageKey = "signavi:studio:checkout-attempt:v1"

function setup({
  token = "test-guest-token",
  storedKey = key,
  status = "paid",
  responseId = id,
  storefront = "signavi_studio"
} = {}) {
  const entries = new Map([
    [`signaviCheckoutToken:${id}`, token],
    [storageKey, JSON.stringify({
      attemptKey: storedKey,
      recoverySecret: "PRIVATE_RECOVERY_SECRET",
      fingerprint: "f".repeat(64)
    })]
  ])

  const storage = {
    getItem: vi.fn(name => entries.get(name) ?? null)
  }

  const api = {
    get: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          orderId: responseId,
          storefront,
          paymentStatus: status,
          email: "PRIVATE_EMAIL"
        }
      }
    })
  }

  return { api, storage, entries }
}

describe("Studio guest payment confirmation", () => {
  it("uses the dedicated endpoint and correct credentials", async () => {
    const { api, storage } = setup()

    const result = await fetchStudioPaymentConfirmation({
      api, orderId: id, storage
    })

    expect(api.get).toHaveBeenCalledWith(
      `/orders/${id}/studio-payment-confirmation`,
      {
        headers: {
          "x-signavi-guest-checkout-token": "test-guest-token",
          "x-signavi-storefront-attempt-key": key
        }
      }
    )

    expect(result).toEqual({
      orderId: id,
      storefront: "signavi_studio",
      paymentStatus: "paid"
    })

    expect(JSON.stringify(api.get.mock.calls)).not.toContain(
      "PRIVATE_RECOVERY_SECRET"
    )

    expect(result).not.toHaveProperty("email")
  })

  it.each(["unpaid", "refunded"])(
    "preserves the %s status",
    async status => {
      const { api, storage } = setup({ status })

      const result = await fetchStudioPaymentConfirmation({
        api, orderId: id, storage
      })

      expect(result.paymentStatus).toBe(status)
    }
  )

  it("does not request when the guest token is missing", async () => {
    const { api, storage, entries } = setup()
    entries.delete(`signaviCheckoutToken:${id}`)

    await expect(fetchStudioPaymentConfirmation({
      api, orderId: id, storage
    })).rejects.toThrow(/credentials are unavailable/)

    expect(api.get).not.toHaveBeenCalled()
  })

  it("rejects a malformed attempt record before HTTP", async () => {
    const { api, storage, entries } = setup()
    entries.set(storageKey, "{broken")

    await expect(fetchStudioPaymentConfirmation({
      api, orderId: id, storage
    })).rejects.toThrow()

    expect(api.get).not.toHaveBeenCalled()
  })

  it("rejects a mismatched response order", async () => {
    const { api, storage } = setup({
      responseId: "507f1f77bcf86cd799439012"
    })

    await expect(fetchStudioPaymentConfirmation({
      api, orderId: id, storage
    })).rejects.toThrow(/could not be verified/)
  })

  it("rejects Signavi Store confirmations", async () => {
    const { api, storage } = setup({
      storefront: "signavi_store"
    })

    await expect(fetchStudioPaymentConfirmation({
      api, orderId: id, storage
    })).rejects.toThrow(/could not be verified/)
  })

  it("rejects an unsupported payment status", async () => {
    const { api, storage } = setup({
      status: "processing"
    })

    await expect(fetchStudioPaymentConfirmation({
      api, orderId: id, storage
    })).rejects.toThrow(/could not be verified/)
  })

  it("rejects malformed order IDs without a request", async () => {
    const { api, storage } = setup()

    await expect(fetchStudioPaymentConfirmation({
      api, orderId: "invalid", storage
    })).rejects.toThrow(/order ID is invalid/)

    expect(api.get).not.toHaveBeenCalled()
  })

  it("preserves credentials when the API fails", async () => {
    const { api, storage, entries } = setup()
    const before = new Map(entries)

    api.get.mockRejectedValue(new Error("Network unavailable"))

    await expect(fetchStudioPaymentConfirmation({
      api, orderId: id, storage
    })).rejects.toThrow("Network unavailable")

    expect([...entries]).toEqual([...before])
  })
})