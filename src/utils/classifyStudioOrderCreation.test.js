import { describe, expect, it } from "vitest"

import {
  classifyStudioOrderCreationResponse,
  classifyStudioOrderCreationError
} from "./classifyStudioOrderCreation.js"

const id = "507f1f77bcf86cd799439011"

function response(data, status = 201) {
  return { status, data }
}

describe("Studio order creation result classification", () => {
  it("accepts a verified data._id and guest token", () => {
    expect(classifyStudioOrderCreationResponse(response({
      success: true,
      data: { _id: id },
      checkoutToken: "GUEST_TOKEN"
    }))).toEqual({
      kind: "created",
      orderId: id,
      checkoutToken: "GUEST_TOKEN",
      canCreateAnotherOrder: false
    })
  })

  it("accepts the legacy order._id response shape", () => {
    const result = classifyStudioOrderCreationResponse(
      response({
        order: { _id: id },
        checkoutToken: "GUEST_TOKEN"
      }, 200)
    )

    expect(result.kind).toBe("created")
  })

  it("accepts the legacy root _id response shape", () => {
    const result = classifyStudioOrderCreationResponse(
      response({
        _id: id,
        checkoutToken: "GUEST_TOKEN"
      })
    )

    expect(result.kind).toBe("created")
  })

  it("rejects a missing order ID as uncertain", () => {
    expect(classifyStudioOrderCreationResponse(
      response({ checkoutToken: "GUEST_TOKEN" })
    ).kind).toBe("uncertain")
  })

  it("rejects a missing guest token as uncertain", () => {
    expect(classifyStudioOrderCreationResponse(
      response({ data: { _id: id } })
    ).kind).toBe("uncertain")
  })

  it("rejects an invalid order ID", () => {
    expect(classifyStudioOrderCreationResponse(
      response({
        data: { _id: "bad" },
        checkoutToken: "GUEST_TOKEN"
      })
    ).kind).toBe("uncertain")
  })

  it("does not treat success:false as created", () => {
    expect(classifyStudioOrderCreationResponse(
      response({
        success: false,
        data: { _id: id },
        checkoutToken: "GUEST_TOKEN"
      })
    ).kind).toBe("uncertain")
  })

  it("does not treat HTTP 409 as created", () => {
    expect(classifyStudioOrderCreationResponse(
      response({
        data: { _id: id },
        checkoutToken: "GUEST_TOKEN"
      }, 409)
    ).kind).toBe("uncertain")
  })

  it.each([400, 401, 403, 404, 422, 423])(
    "rejects HTTP %s without allowing a new order",
    status => {
      expect(classifyStudioOrderCreationError({
        response: { status }
      })).toEqual({
        kind: "rejected",
        reason: "request_rejected",
        canCreateAnotherOrder: false
      })
    }
  )

  it.each([408, 409, 429, 500, 502, 503, 504])(
    "treats HTTP %s as unsafe to retry automatically",
    status => {
      const result = classifyStudioOrderCreationError({
        response: { status }
      })

      expect(result.kind).toBe("uncertain")
      expect(result.canCreateAnotherOrder).toBe(false)
    }
  )

  it("treats a dropped connection as uncertain", () => {
    const result = classifyStudioOrderCreationError(
      new Error("Connection lost")
    )

    expect(result.kind).toBe("uncertain")
    expect(result.canCreateAnotherOrder).toBe(false)
  })

  it("treats a timeout as uncertain", () => {
    const result = classifyStudioOrderCreationError({
      code: "ECONNABORTED",
      message: "timeout"
    })

    expect(result.kind).toBe("uncertain")
  })

  it("never enables automatic duplicate-order creation", () => {
    const results = [
      classifyStudioOrderCreationResponse(null),
      classifyStudioOrderCreationResponse(
        response({ data: { _id: id } })
      ),
      classifyStudioOrderCreationError({
        response: { status: 409 }
      })
    ]

    expect(results.every(
      value => value.canCreateAnotherOrder === false
    )).toBe(true)
  })
})