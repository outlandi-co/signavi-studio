import { describe, expect, it, vi } from "vitest"

import {
  finalizeStudioPaidCheckout
} from "./finalizeStudioPaidCheckout.js"

import {
  completedStudioConfirmationKey
} from "./preserveStudioPaidConfirmationKey.js"

const id = "507f1f77bcf86cd799439011"
const key = "123e4567-e89b-42d3-a456-426614174000"
const newerKey = "123e4567-e89b-42d3-a456-426614174001"
const activeName = "signavi:studio:checkout-attempt:v1"
const archivedName = completedStudioConfirmationKey(id)

function setup() {
  const entries = new Map([
    [activeName, JSON.stringify({
      attemptKey: key,
      recoverySecret: "PRIVATE_RECOVERY_SECRET",
      fingerprint: "f".repeat(64)
    })],
    [`signaviCheckoutToken:${id}`, "KEEP_GUEST_TOKEN"],
    ["unrelated", "KEEP"]
  ])

  const storage = {
    getItem: vi.fn(name => entries.get(name) ?? null),
    setItem: vi.fn((name, value) => entries.set(name, value)),
    removeItem: vi.fn(name => entries.delete(name))
  }

  function complete(overrides = {}) {
    return finalizeStudioPaidCheckout({
      storage,
      confirmation: {
        orderId: id,
        storefront: "signavi_studio",
        paymentStatus: "paid"
      },
      orderId: id,
      attemptKey: key,
      ...overrides
    })
  }

  return { entries, storage, complete }
}

describe("Studio verified paid checkout finalization", () => {
  it("archives UUID before retiring a matching paid attempt", () => {
    const { entries, storage, complete } = setup()

    expect(complete()).toEqual({
      preserved: true,
      retired: true
    })

    expect(entries.get(archivedName)).toBe(key)
    expect(entries.has(activeName)).toBe(false)
    expect(entries.get(`signaviCheckoutToken:${id}`))
      .toBe("KEEP_GUEST_TOKEN")
    expect(entries.get("unrelated")).toBe("KEEP")

    expect(storage.setItem.mock.invocationCallOrder[0])
      .toBeLessThan(
        storage.removeItem.mock.invocationCallOrder[0]
      )
  })

  it.each(["unpaid", "refunded"])(
    "does not retire a %s purchase",
    paymentStatus => {
      const { entries, storage, complete } = setup()

      expect(complete({
        confirmation: {
          orderId: id,
          storefront: "signavi_studio",
          paymentStatus
        }
      })).toEqual({
        preserved: false,
        retired: false
      })

      expect(entries.has(activeName)).toBe(true)
      expect(entries.has(archivedName)).toBe(false)
      expect(storage.removeItem).not.toHaveBeenCalled()
    }
  )

  it("does not retire a different storefront", () => {
    const { entries, complete } = setup()

    expect(complete({
      confirmation: {
        orderId: id,
        storefront: "signavi_store",
        paymentStatus: "paid"
      }
    }).retired).toBe(false)

    expect(entries.has(activeName)).toBe(true)
  })

  it("does not retire a different order", () => {
    const { entries, complete } = setup()

    expect(complete({
      confirmation: {
        orderId: "507f1f77bcf86cd799439012",
        storefront: "signavi_studio",
        paymentStatus: "paid"
      }
    }).retired).toBe(false)

    expect(entries.has(activeName)).toBe(true)
  })

  it("protects a newer active checkout", () => {
    const { entries, storage, complete } = setup()

    entries.set(activeName, JSON.stringify({
      attemptKey: newerKey,
      recoverySecret: "NEW_PRIVATE_SECRET",
      fingerprint: "a".repeat(64)
    }))

    expect(complete()).toEqual({
      preserved: false,
      retired: false
    })

    expect(entries.has(activeName)).toBe(true)
    expect(storage.removeItem).not.toHaveBeenCalled()
  })

  it("does not retire if preserving the UUID fails", () => {
    const { entries, storage, complete } = setup()

    storage.setItem = vi.fn(() => {
      throw new Error("Storage unavailable")
    })

    expect(complete()).toEqual({
      preserved: false,
      retired: false
    })

    expect(entries.has(activeName)).toBe(true)
    expect(storage.removeItem).not.toHaveBeenCalled()
  })

  it("does not remove another order's archived UUID", () => {
    const { entries, complete } = setup()
    const other = completedStudioConfirmationKey(
      "507f1f77bcf86cd799439012"
    )

    entries.set(other, newerKey)

    expect(complete().retired).toBe(true)
    expect(entries.get(other)).toBe(newerKey)
  })
})