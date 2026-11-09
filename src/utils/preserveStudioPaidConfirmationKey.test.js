import { describe, expect, it, vi } from "vitest"
import {
  completedStudioConfirmationKey,
  preserveStudioPaidConfirmationKey
} from "./preserveStudioPaidConfirmationKey.js"

const id = "507f1f77bcf86cd799439011"
const otherId = "507f1f77bcf86cd799439012"
const key = "123e4567-e89b-42d3-a456-426614174000"
const otherKey = "123e4567-e89b-42d3-a456-426614174001"
const activeKey = "signavi:studio:checkout-attempt:v1"
const completedKey = completedStudioConfirmationKey(id)

function setup() {
  const entries = new Map([
    [activeKey, JSON.stringify({
      attemptKey: key,
      recoverySecret: "PRIVATE_RECOVERY_SECRET",
      fingerprint: "f".repeat(64)
    })],
    [`signaviCheckoutToken:${id}`, "GUEST_TOKEN"]
  ])

  const storage = {
    getItem: vi.fn(k => entries.get(k) ?? null),
    setItem: vi.fn((k, v) => entries.set(k, v))
  }

  const confirmation = {
    orderId: id,
    storefront: "signavi_studio",
    paymentStatus: "paid"
  }

  function run(overrides = {}) {
    return preserveStudioPaidConfirmationKey({
      storage,
      confirmation,
      expectedOrderId: id,
      expectedAttemptKey: key,
      ...overrides
    })
  }

  return { entries, storage, confirmation, run }
}

describe("Studio completed-payment key preservation", () => {
  it("preserves only the paid order attempt UUID", () => {
    const { entries, run } = setup()
    expect(run()).toBe(true)
    expect(entries.get(completedKey)).toBe(key)
    expect(entries.get(completedKey)).not.toContain("PRIVATE")
  })

  it("keeps the active checkout record", () => {
    const { entries, run } = setup()
    expect(run()).toBe(true)
    expect(entries.has(activeKey)).toBe(true)
  })

  it("keeps the guest token", () => {
    const { entries, run } = setup()
    expect(run()).toBe(true)
    expect(entries.get(`signaviCheckoutToken:${id}`)).toBe("GUEST_TOKEN")
  })

  it("is idempotent for the matching archived UUID", () => {
    const { entries, storage, run } = setup()
    entries.set(completedKey, key)
    expect(run()).toBe(true)
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it.each(["unpaid", "refunded"])(
    "does not archive %s payment",
    paymentStatus => {
      const { storage, confirmation, run } = setup()
      expect(run({
        confirmation: { ...confirmation, paymentStatus }
      })).toBe(false)
      expect(storage.setItem).not.toHaveBeenCalled()
    }
  )

  it("rejects confirmation for a different order", () => {
    const { storage, confirmation, run } = setup()
    expect(run({
      confirmation: { ...confirmation, orderId: otherId }
    })).toBe(false)
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it("rejects Signavi Store confirmations", () => {
    const { storage, confirmation, run } = setup()
    expect(run({
      confirmation: {
        ...confirmation,
        storefront: "signavi_store"
      }
    })).toBe(false)
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it("rejects a replaced active checkout attempt", () => {
    const { entries, storage, run } = setup()
    entries.set(activeKey, JSON.stringify({
      attemptKey: otherKey,
      recoverySecret: "OTHER_SECRET"
    }))
    expect(run()).toBe(false)
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it("requires a captured attempt key", () => {
    const { storage, run } = setup()
    expect(run({ expectedAttemptKey: undefined })).toBe(false)
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it("never overwrites a conflicting archived key", () => {
    const { entries, run } = setup()
    entries.set(completedKey, otherKey)
    expect(run()).toBe(false)
    expect(entries.get(completedKey)).toBe(otherKey)
  })

  it("rejects an active record changed during inspection", () => {
    const { entries, storage, run } = setup()
    const get = storage.getItem
    let reads = 0

    storage.getItem = vi.fn(name => {
      if (name === activeKey && ++reads === 2) {
        entries.set(activeKey, JSON.stringify({
          attemptKey: otherKey
        }))
      }
      return get(name)
    })

    expect(run()).toBe(false)
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it("fails closed when storage rejects writes", () => {
    const { entries, storage, run } = setup()
    storage.setItem = vi.fn(() => {
      throw new Error("Storage unavailable")
    })

    expect(run()).toBe(false)
    expect(entries.has(activeKey)).toBe(true)
    expect(entries.has(completedKey)).toBe(false)
  })

  it("rejects malformed active checkout JSON", () => {
    const { entries, storage, run } = setup()
    entries.set(activeKey, "{broken")
    expect(run()).toBe(false)
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it("uses a separate key for each order", () => {
    expect(completedStudioConfirmationKey(otherId))
      .not.toBe(completedKey)
  })

  it("rejects invalid order IDs", () => {
    expect(() => completedStudioConfirmationKey("invalid"))
      .toThrow("Invalid completed-order ID.")
  })
})