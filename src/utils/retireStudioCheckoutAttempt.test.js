import { describe, expect, it, vi } from "vitest"

import {
  retireStudioCheckoutAttempt,
  STUDIO_CHECKOUT_ATTEMPT_STORAGE_KEY
} from "./retireStudioCheckoutAttempt.js"

const id = "507f1f77bcf86cd799439011"
const key = "123e4567-e89b-42d3-a456-426614174000"
const newerKey = "123e4567-e89b-42d3-a456-426614174001"

function makeStorage(attemptKey = key) {
  const entries = new Map([
    [
      STUDIO_CHECKOUT_ATTEMPT_STORAGE_KEY,
      JSON.stringify({
        attemptKey,
        recoverySecret: "PRIVATE_RECOVERY_SECRET",
        fingerprint: "f".repeat(64)
      })
    ],
    [`signaviCheckoutToken:${id}`, "KEEP_GUEST_TOKEN"],
    [`signaviCheckoutQuote:${id}`, "KEEP_SHIPPING_QUOTE"],
    ["other-session-value", "KEEP_UNRELATED_DATA"]
  ])

  return {
    entries,
    getItem: vi.fn(name => entries.get(name) ?? null),
    removeItem: vi.fn(name => entries.delete(name))
  }
}

function paidConfirmation(overrides = {}) {
  return {
    orderId: id,
    storefront: "signavi_studio",
    paymentStatus: "paid",
    ...overrides
  }
}

function retire(storage, overrides = {}) {
  return retireStudioCheckoutAttempt({
    storage,
    confirmation: paidConfirmation(),
    expectedOrderId: id,
    expectedAttemptKey: key,
    ...overrides
  })
}

describe("Studio checkout attempt retirement", () => {
  it("retires only the matching paid attempt", () => {
    const storage = makeStorage()

    expect(retire(storage)).toBe(true)

    expect(
      storage.entries.has(STUDIO_CHECKOUT_ATTEMPT_STORAGE_KEY)
    ).toBe(false)

    expect(storage.entries.get(`signaviCheckoutToken:${id}`))
      .toBe("KEEP_GUEST_TOKEN")

    expect(storage.entries.get(`signaviCheckoutQuote:${id}`))
      .toBe("KEEP_SHIPPING_QUOTE")

    expect(storage.entries.get("other-session-value"))
      .toBe("KEEP_UNRELATED_DATA")

    expect(storage.removeItem).toHaveBeenCalledTimes(1)
  })

  it.each(["unpaid", "refunded"])(
    "preserves credentials when status is %s",
    status => {
      const storage = makeStorage()

      expect(retire(storage, {
        confirmation: paidConfirmation({
          paymentStatus: status
        })
      })).toBe(false)

      expect(storage.removeItem).not.toHaveBeenCalled()
    }
  )

  it("rejects another order ID", () => {
    const storage = makeStorage()

    expect(retire(storage, {
      confirmation: paidConfirmation({
        orderId: "507f1f77bcf86cd799439012"
      })
    })).toBe(false)

    expect(storage.removeItem).not.toHaveBeenCalled()
  })

  it("rejects Signavi Store payment status", () => {
    const storage = makeStorage()

    expect(retire(storage, {
      confirmation: paidConfirmation({
        storefront: "signavi_store"
      })
    })).toBe(false)

    expect(storage.removeItem).not.toHaveBeenCalled()
  })

  it("does not retire an attempt replaced by a newer one", () => {
    const storage = makeStorage(newerKey)

    expect(retire(storage)).toBe(false)

    expect(storage.removeItem).not.toHaveBeenCalled()
  })

  it("requires the originally captured attempt key", () => {
    const storage = makeStorage()

    expect(retire(storage, {
      expectedAttemptKey: undefined
    })).toBe(false)

    expect(storage.removeItem).not.toHaveBeenCalled()
  })

  it("preserves malformed stored credentials", () => {
    const storage = makeStorage()

    storage.entries.set(
      STUDIO_CHECKOUT_ATTEMPT_STORAGE_KEY,
      "{invalid-json"
    )

    expect(retire(storage)).toBe(false)
    expect(storage.removeItem).not.toHaveBeenCalled()
  })

  it("preserves attempts when confirmation is unavailable", () => {
    const storage = makeStorage()

    expect(retire(storage, {
      confirmation: null
    })).toBe(false)

    expect(storage.removeItem).not.toHaveBeenCalled()
  })

  it("does not clear an attempt changed during inspection", () => {
    const storage = makeStorage()
    const originalGetItem = storage.getItem
    let reads = 0

    storage.getItem = vi.fn(name => {
      if (name === STUDIO_CHECKOUT_ATTEMPT_STORAGE_KEY) {
        reads++

        if (reads === 2) {
          storage.entries.set(
            STUDIO_CHECKOUT_ATTEMPT_STORAGE_KEY,
            JSON.stringify({
              attemptKey: newerKey,
              recoverySecret: "NEW_SECRET",
              fingerprint: "a".repeat(64)
            })
          )
        }
      }

      return originalGetItem(name)
    })

    expect(retire(storage)).toBe(false)
    expect(storage.removeItem).not.toHaveBeenCalled()
  })

  it("handles unavailable browser storage without deletion", () => {
    const storage = {
      getItem() {
        throw new Error("Storage unavailable")
      },
      removeItem: vi.fn()
    }

    expect(retire(storage)).toBe(false)
    expect(storage.removeItem).not.toHaveBeenCalled()
  })
})