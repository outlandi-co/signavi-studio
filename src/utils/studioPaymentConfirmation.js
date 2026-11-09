import { resolveStudioConfirmationAttemptKey } from "./resolveStudioConfirmationAttemptKey.js"

// The resolver handles active and completed-order records.

const ORDER_ID = /^[a-f0-9]{24}$/i

const ATTEMPT_KEY =
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i

const PAYMENT_STATUSES = new Set([
  "unpaid",
  "paid",
  "refunded"
])

export async function fetchStudioPaymentConfirmation({
  api,
  orderId,
  storage
}) {
  const id = String(orderId ?? "").trim().toLowerCase()

  if (!ORDER_ID.test(id)) {
    throw new Error("Payment confirmation order ID is invalid.")
  }

  if (
    typeof api?.get !== "function" ||
    typeof storage?.getItem !== "function"
  ) {
    throw new Error("Payment confirmation is unavailable.")
  }

  const guestToken = storage.getItem(
    `signaviCheckoutToken:${id}`
  )

  const attemptKey = resolveStudioConfirmationAttemptKey({
    storage,
    orderId: id
  })

  if (
    typeof guestToken !== "string" ||
    guestToken.length === 0 ||
    guestToken.length > 2048 ||
    !ATTEMPT_KEY.test(attemptKey)
  ) {
    throw new Error(
      "Checkout credentials are unavailable. Payment status is not confirmed."
    )
  }

  // The recovery secret must never be sent to confirmation.
  const response = await api.get(
    `/orders/${id}/studio-payment-confirmation`,
    {
      headers: {
        "x-signavi-guest-checkout-token": guestToken,
        "x-signavi-storefront-attempt-key": attemptKey
      }
    }
  )

  const data = response?.data?.data

  if (
    response?.data?.success !== true ||
    String(data?.orderId ?? "").toLowerCase() !== id ||
    data?.storefront !== "signavi_studio" ||
    !PAYMENT_STATUSES.has(data?.paymentStatus)
  ) {
    throw new Error(
      "The payment confirmation response could not be verified."
    )
  }

  return Object.freeze({
    orderId: id,
    storefront: "signavi_studio",
    paymentStatus: data.paymentStatus
  })
}