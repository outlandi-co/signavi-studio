const ORDER_ID = /^[a-f0-9]{24}$/i

function result(kind, reason) {
  return Object.freeze({
    kind,
    reason,
    canCreateAnotherOrder: false
  })
}

/**
 * Classification only.
 *
 * Never sends a request, creates an order, or retries checkout.
 * The original checkout attempt must be retained for all
 * rejected or uncertain outcomes.
 */
export function classifyStudioOrderCreationResponse(response) {
  const data = response?.data

  const id =
    data?.data?._id ??
    data?.order?._id ??
    data?._id

  const token = data?.checkoutToken

  if (
    response?.status >= 200 &&
    response?.status < 300 &&
    data?.success !== false &&
    typeof id === "string" &&
    ORDER_ID.test(id) &&
    typeof token === "string" &&
    token.trim() &&
    token.length <= 2048
  ) {
    return Object.freeze({
      kind: "created",
      orderId: id.toLowerCase(),
      checkoutToken: token,
      canCreateAnotherOrder: false
    })
  }

  return result("uncertain", "incomplete_order_response")
}

export function classifyStudioOrderCreationError(error) {
  const status = error?.response?.status

  // No trustworthy HTTP response means the backend might
  // have created the order before the connection failed.
  if (!Number.isInteger(status)) {
    return result("uncertain", "network_or_unknown")
  }

  // Conflicts must be resolved through proof-based recovery,
  // never by automatically creating another order.
  if (status === 409) {
    return result("uncertain", "conflict_requires_recovery")
  }

  if (status === 408 || status === 429 || status >= 500) {
    return result("uncertain", "server_outcome_unknown")
  }

  // These are reported as rejected, not safe-to-retry.
  if (status >= 400 && status < 500) {
    return result("rejected", "request_rejected")
  }

  return result("uncertain", "unexpected_response")
}