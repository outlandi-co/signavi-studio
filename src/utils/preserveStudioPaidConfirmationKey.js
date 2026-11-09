const ACTIVE_KEY = "signavi:studio:checkout-attempt:v1"
const COMPLETED_PREFIX = "signavi:studio:paid-confirmation-attempt:"

const OBJECT_ID = /^[a-f0-9]{24}$/i
const UUID_V4 = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i

export function completedStudioConfirmationKey(orderId) {
  const id = String(orderId ?? "").toLowerCase()

  if (!OBJECT_ID.test(id)) {
    throw new Error("Invalid completed-order ID.")
  }

  return COMPLETED_PREFIX + id
}

// Call only after a verified paid Studio confirmation.
// expectedAttemptKey must be captured before the HTTP request.
export function preserveStudioPaidConfirmationKey({
  storage,
  confirmation,
  expectedOrderId,
  expectedAttemptKey
} = {}) {
  if (
    typeof storage?.getItem !== "function" ||
    typeof storage?.setItem !== "function"
  ) {
    return false
  }

  const id = String(expectedOrderId ?? "").toLowerCase()
  const key = String(expectedAttemptKey ?? "").toLowerCase()

  if (
    !OBJECT_ID.test(id) ||
    !UUID_V4.test(key) ||
    confirmation?.storefront !== "signavi_studio" ||
    confirmation?.paymentStatus !== "paid" ||
    String(confirmation?.orderId ?? "").toLowerCase() !== id
  ) {
    return false
  }

  try {
    const original = storage.getItem(ACTIVE_KEY)

    if (typeof original !== "string") {
      return false
    }

    const active = JSON.parse(original)

    if (
      typeof active?.attemptKey !== "string" ||
      active.attemptKey.toLowerCase() !== key
    ) {
      return false
    }

    const completedKey = completedStudioConfirmationKey(id)
    const existing = storage.getItem(completedKey)

    // Never overwrite a different completed-order key.
    if (existing !== null && existing !== key) {
      return false
    }

    // Ensure the active attempt has not changed.
    if (storage.getItem(ACTIVE_KEY) !== original) {
      return false
    }

    if (existing === key) {
      return true
    }

    // Store only the UUID. No recovery secret or order payload.
    storage.setItem(completedKey, key)

    return storage.getItem(completedKey) === key
  } catch {
    return false
  }
}