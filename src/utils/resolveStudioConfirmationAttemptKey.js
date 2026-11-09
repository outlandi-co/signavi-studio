import {
  completedStudioConfirmationKey
} from "./preserveStudioPaidConfirmationKey.js"

const ACTIVE_KEY = "signavi:studio:checkout-attempt:v1"

const UUID_V4 =
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i

/**
 * Archive-first resolution avoids confusing an older paid
 * order with a newer active checkout attempt.
 *
 * A stored UUID is not payment proof. The backend still
 * verifies the guest token and the order's attempt UUID.
 */
export function resolveStudioConfirmationAttemptKey({
  storage,
  orderId
} = {}) {
  if (typeof storage?.getItem !== "function") {
    return ""
  }

  try {
    const completedKey = completedStudioConfirmationKey(orderId)
    const archived = storage.getItem(completedKey)

    // An archived record takes precedence. If it is corrupt,
    // fail closed rather than substituting another attempt.
    if (archived !== null) {
      return typeof archived === "string" &&
        UUID_V4.test(archived)
        ? archived.toLowerCase()
        : ""
    }

    const raw = storage.getItem(ACTIVE_KEY)

    if (typeof raw !== "string") {
      return ""
    }

    const active = JSON.parse(raw)
    const key = active?.attemptKey

    return typeof key === "string" &&
      UUID_V4.test(key)
      ? key.toLowerCase()
      : ""
  } catch {
    return ""
  }
}
