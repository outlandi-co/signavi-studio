import { describe, expect, it, vi } from "vitest"

import { createStudioOrderGuarded }
  from "./createStudioOrderGuarded.js"

const attempt = {
  attemptKey: "123e4567-e89b-42d3-a456-426614174000",
  recoverySecret: "A".repeat(43)
}

const payload = {
  storefront: "signavi_studio",
  items: [{ productId: "test", quantity: 1 }]
}

function setup() {
  const entries = new Map()
  const storage = {
    getItem: vi.fn(name => entries.get(name) ?? null),
    setItem: vi.fn((name, value) => entries.set(name, value))
  }

  const api = { post: vi.fn() }

  const createOrder = vi.fn().mockResolvedValue({
    kind: "created",
    orderId: "507f1f77bcf86cd799439011",
    checkoutToken: "TOKEN",
    canCreateAnotherOrder: false
  })

  const run = overrides => createStudioOrderGuarded({
    api,
    storage,
    orderPayload: payload,
    attempt,
    createOrder,
    ...overrides
  })

  return { entries, storage, api, createOrder, run }
}

describe("Studio checkout submission guard", () => {
  it("allows one initial submission", async () => {
    const { run, createOrder } = setup()

    expect((await run()).kind).toBe("created")
    expect(createOrder).toHaveBeenCalledTimes(1)
  })

  it("blocks a repeat submission", async () => {
    const { run, createOrder } = setup()

    await run()
    expect(await run()).toEqual({
      kind: "blocked",
      reason: "already_submitted",
      canCreateAnotherOrder: false
    })

    expect(createOrder).toHaveBeenCalledTimes(1)
  })

  it("blocks concurrent duplicate clicks", async () => {
    const { run, createOrder } = setup()

    const [first, second] = await Promise.all([
      run(),
      run()
    ])

    expect(first.kind).toBe("created")
    expect(second.kind).toBe("blocked")
    expect(createOrder).toHaveBeenCalledTimes(1)
  })

  it("retains the marker after a timeout", async () => {
    const { run, createOrder } = setup()

    createOrder.mockResolvedValue({
      kind: "uncertain",
      reason: "network_or_unknown",
      canCreateAnotherOrder: false
    })

    expect((await run()).kind).toBe("uncertain")
    expect((await run()).kind).toBe("blocked")
    expect(createOrder).toHaveBeenCalledTimes(1)
  })

  it("retains the marker after an HTTP conflict", async () => {
    const { run, createOrder } = setup()

    createOrder.mockResolvedValue({
      kind: "uncertain",
      reason: "conflict_requires_recovery",
      canCreateAnotherOrder: false
    })

    await run()
    expect((await run()).kind).toBe("blocked")
    expect(createOrder).toHaveBeenCalledTimes(1)
  })

  it("fails closed when session storage is unavailable", async () => {
    const { run, storage, createOrder } = setup()

    storage.setItem = vi.fn(() => {
      throw new Error("Storage denied")
    })

    expect((await run()).kind).toBe("blocked")
    expect(createOrder).not.toHaveBeenCalled()
  })

  it("rejects a different storefront", async () => {
    const { run, createOrder } = setup()

    expect((await run({
      orderPayload: { ...payload, storefront: "signavi_store" }
    })).kind).toBe("blocked")

    expect(createOrder).not.toHaveBeenCalled()
  })

  it("allows a distinct new checkout UUID", async () => {
    const { run, createOrder } = setup()

    await run()

    const anotherAttempt = {
      ...attempt,
      attemptKey: "123e4567-e89b-42d3-a456-426614174001"
    }

    expect((await run({
      attempt: anotherAttempt
    })).kind).toBe("created")

    expect(createOrder).toHaveBeenCalledTimes(2)
  })

  it("preserves existing checkout recovery credentials", async () => {
    const { run, entries } = setup()

    const active = JSON.stringify({
      ...attempt,
      fingerprint: "f".repeat(64)
    })

    entries.set("signavi:studio:checkout-attempt:v1", active)

    await run()

    expect(entries.get(
      "signavi:studio:checkout-attempt:v1"
    )).toBe(active)
  })

  it("keeps the marker after an unexpected exception", async () => {
    const { run, createOrder } = setup()

    createOrder.mockRejectedValue(
      new Error("Unexpected failure")
    )

    expect((await run()).kind).toBe("uncertain")
    expect((await run()).kind).toBe("blocked")
    expect(createOrder).toHaveBeenCalledTimes(1)
  })
})