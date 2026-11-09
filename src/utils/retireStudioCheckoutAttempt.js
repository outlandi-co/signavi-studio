const STORAGE_KEY = "signavi:studio:checkout-attempt:v1"

const OBJECT_ID = /^[a-f0-9]{24}$/i

const ATTEMPT_KEY =
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i

function readAttempt(storage) {
  const raw = storage.getItem(STORAGE_KEY)

  if (typeof raw !== "string") {
    return null
  }

  try {
    const parsed = JSON.parse(raw)

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !ATTEMPT_KEY.test(String(parsed.attemptKey ?? ""))
    ) {
      return null
    }

    return {
      raw,
      attemptKey: parsed.attemptKey.toLowerCase()
    }
  } catch {
    return null
  }
}

/**
 * Retires only the checkout attempt that initiated a
 * previously verified Studio payment-confirmation request.
 *
 * The caller must supply the attempt key captured BEFORE
 * the confirmation request. Never read the expected key
 * from storage only after the request finishes.
 *
 * This helper does not authenticate payment evidence.
 * It must only be called following verified confirmation.
 */
export function retireStudioCheckoutAttempt({
  storage,
  confirmation,
  expectedOrderId,
  expectedAttemptKey
} = {}) {
  if (
    typeof storage?.getItem !== "function" ||
    typeof storage?.removeItem !== "function"
  ) {
    return false
  }

  const orderId = String(expectedOrderId ?? "").toLowerCase()
  const expectedKey =
    String(expectedAttemptKey ?? "").toLowerCase()

  if (
    !OBJECT_ID.test(orderId) ||
    !ATTEMPT_KEY.test(expectedKey) ||
    confirmation?.storefront !== "signavi_studio" ||
    confirmation?.paymentStatus !== "paid" ||
    String(confirmation?.orderId ?? "").toLowerCase() !== orderId
  ) {
    return false
  }

  try {
    const first = readAttempt(storage)

    if (!first || first.attemptKey !== expectedKey) {
      return false
    }

    // Re-read just before removal to avoid retiring a
    // checkout record replaced during confirmation.
    const current = readAttempt(storage)

    if (
      !current ||
      current.attemptKey !== expectedKey ||
      current.raw !== first.raw
    ) {
      return false
    }

    storage.removeItem(STORAGE_KEY)

    return true
  } catch {
    // Fail closed. Do not erase other checkout data.
    return false
  }
}

export const STUDIO_CHECKOUT_ATTEMPT_STORAGE_KEY = STORAGE_KEY