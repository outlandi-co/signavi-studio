const OBJECT_ID = /^[a-f0-9]{24}$/i

const UUID_V4 =
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i

const RECOVERY_SECRET = /^[A-Za-z0-9_-]{43}$/

const unavailable = Object.freeze({
  recovered: false,
  reason: "unavailable"
})

function failure(reason) {
  return Object.freeze({
    recovered: false,
    reason
  })
}

/**
 * Recovery never creates a new order.
 *
 * Disabled by default. The enabled flag is currently
 * intended for mocked contract tests only.
 *
 * Never automatically retry POST /orders from here.
 */
export async function recoverStudioCheckoutRequest({
  api,
  originalRequest,
  attempt,
  enabled = false
} = {}) {
  if (enabled !== true) {
    return unavailable
  }

  if (
    typeof api?.post !== "function" ||
    !originalRequest ||
    typeof originalRequest !== "object" ||
    Array.isArray(originalRequest) ||
    originalRequest.storefront !== "signavi_studio" ||
    !UUID_V4.test(String(attempt?.attemptKey ?? "")) ||
    !RECOVERY_SECRET.test(String(attempt?.recoverySecret ?? ""))
  ) {
    return failure("invalid_request")
  }

  try {
    const response = await api.post(
      "/orders/storefront/recover",
      { originalRequest },
      {
        headers: {
          "x-signavi-storefront-attempt-key": attempt.attemptKey,
          "x-signavi-storefront-recovery-secret": attempt.recoverySecret
        }
      }
    )

    const data = response?.data
    const orderId = String(data?.orderId ?? "").toLowerCase()
    const token = data?.checkoutToken

    if (
      response?.status !== 200 ||
      data?.success !== true ||
      !OBJECT_ID.test(orderId) ||
      typeof token !== "string" ||
      !token.trim() ||
      token.length > 2048
    ) {
      return failure("invalid_response")
    }

    return Object.freeze({
      recovered: true,
      orderId,
      checkoutToken: token
    })
  } catch (err) {
    const status = err?.response?.status

    if (status === 403) {
      return failure("unauthorized")
    }

    if (status === 404 || status === 503) {
      return unavailable
    }

    if (status === 409) {
      return failure("conflict")
    }

    // Network failures, timeouts, and unknown errors
    // must not trigger another order creation.
    return failure("uncertain")
  }
}