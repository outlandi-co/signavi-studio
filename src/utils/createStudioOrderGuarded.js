import { createStudioOrderOnce } from "./createStudioOrderOnce.js"

const PREFIX = "signavi:studio:order-submission:v1:"

const UUID_V4 =
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i

function blocked(reason) {
  return Object.freeze({
    kind: "blocked",
    reason,
    canCreateAnotherOrder: false
  })
}

/**
 * One submission per checkout attempt within a session.
 *
 * A durable marker is written BEFORE invoking order creation.
 * It remains after network errors and HTTP 409 conflicts.
 *
 * No automatic retry or recovery call.
 * A genuinely new purchase uses a new attempt UUID.
 */
export async function createStudioOrderGuarded({
  api,
  orderPayload,
  attempt,
  storage,
  createOrder = createStudioOrderOnce
} = {}) {
  const key = String(attempt?.attemptKey ?? "").toLowerCase()

  if (
    !UUID_V4.test(key) ||
    typeof attempt?.recoverySecret !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/.test(attempt.recoverySecret) ||
    orderPayload?.storefront !== "signavi_studio" ||
    typeof api?.post !== "function" ||
    typeof storage?.getItem !== "function" ||
    typeof storage?.setItem !== "function" ||
    typeof createOrder !== "function"
  ) {
    return blocked("invalid_submission")
  }

  const marker = PREFIX + key

  try {
    if (storage.getItem(marker) !== null) {
      return blocked("already_submitted")
    }

    // Synchronous write blocks a second click before HTTP starts.
    storage.setItem(marker, "submitted")

    if (storage.getItem(marker) !== "submitted") {
      return blocked("storage_unavailable")
    }
  } catch {
    return blocked("storage_unavailable")
  }

  try {
    return await createOrder({
      api,
      orderPayload,
      attempt
    })
  } catch {
    // Never clear the marker after an uncertain exception.
    return Object.freeze({
      kind: "uncertain",
      reason: "unexpected_creation_failure",
      canCreateAnotherOrder: false
    })
  }
}