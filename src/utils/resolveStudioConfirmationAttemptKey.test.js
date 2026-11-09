import { describe, expect, it, vi } from "vitest"
import {
  resolveStudioConfirmationAttemptKey
} from "./resolveStudioConfirmationAttemptKey.js"
import {
  completedStudioConfirmationKey
} from "./preserveStudioPaidConfirmationKey.js"
import {
  fetchStudioPaymentConfirmation
} from "./studioPaymentConfirmation.js"

const id = "507f1f77bcf86cd799439011"
const previousKey = "123e4567-e89b-42d3-a456-426614174000"
const newerKey = "123e4567-e89b-42d3-a456-426614174001"

const activeName = "signavi:studio:checkout-attempt:v1"
const archivedName = completedStudioConfirmationKey(id)

function setup() {
  const entries = new Map([
    [`signaviCheckoutToken:${id}`, "GUEST_TOKEN"],
    [activeName, JSON.stringify({
      attemptKey: newerKey,
      recoverySecret: "PRIVATE_NEW_SECRET",
      fingerprint: "f".repeat(64)
    })],
    [archivedName, previousKey]
  ])

  const storage = {
    getItem: vi.fn(name => entries.get(name) ?? null),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }

  const api = {
    get: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          orderId: id,
          storefront: "signavi_studio",
          paymentStatus: "paid"
        }
      }
    })
  }

  return { entries, storage, api }
}

describe("Studio completed-order confirmation resolution", () => {
  it("prefers the older archived UUID over a newer checkout", () => {
    const { storage } = setup()

    expect(resolveStudioConfirmationAttemptKey({
      storage,
      orderId: id
    })).toBe(previousKey)
  })

  it("confirms using the archived key, not the newer key", async () => {
    const { storage, api } = setup()

    const result = await fetchStudioPaymentConfirmation({
      api,
      orderId: id,
      storage
    })

    expect(result.paymentStatus).toBe("paid")
    expect(api.get).toHaveBeenCalledWith(
      `/orders/${id}/studio-payment-confirmation`,
      {
        headers: {
          "x-signavi-guest-checkout-token": "GUEST_TOKEN",
          "x-signavi-storefront-attempt-key": previousKey
        }
      }
    )

    expect(JSON.stringify(api.get.mock.calls))
      .not.toContain("PRIVATE_NEW_SECRET")
  })

  it("uses the archived key after the active attempt is retired", async () => {
    const { entries, storage, api } = setup()
    entries.delete(activeName)

    const result = await fetchStudioPaymentConfirmation({
      api,
      orderId: id,
      storage
    })

    expect(result.paymentStatus).toBe("paid")

    expect(api.get.mock.calls[0][1].headers[
      "x-signavi-storefront-attempt-key"
    ]).toBe(previousKey)
  })

  it("falls back to an active attempt if no archive exists", () => {
    const { entries, storage } = setup()
    entries.delete(archivedName)

    expect(resolveStudioConfirmationAttemptKey({
      storage,
      orderId: id
    })).toBe(newerKey)
  })

  it("does not substitute an active key for a corrupt archive", async () => {
    const { entries, storage, api } = setup()
    entries.set(archivedName, "invalid")

    await expect(fetchStudioPaymentConfirmation({
      api,
      orderId: id,
      storage
    })).rejects.toThrow(/credentials are unavailable/)

    expect(api.get).not.toHaveBeenCalled()
  })

  it("requires the original order's guest token", async () => {
    const { entries, storage, api } = setup()
    entries.delete(`signaviCheckoutToken:${id}`)

    await expect(fetchStudioPaymentConfirmation({
      api,
      orderId: id,
      storage
    })).rejects.toThrow(/credentials are unavailable/)

    expect(api.get).not.toHaveBeenCalled()
  })

  it("does not mutate browser checkout storage", async () => {
    const { entries, storage, api } = setup()
    const before = [...entries]

    await fetchStudioPaymentConfirmation({
      api,
      orderId: id,
      storage
    })

    expect([...entries]).toEqual(before)
    expect(storage.setItem).not.toHaveBeenCalled()
    expect(storage.removeItem).not.toHaveBeenCalled()
  })
})
