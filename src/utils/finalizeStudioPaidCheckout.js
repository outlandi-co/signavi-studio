import {
  preserveStudioPaidConfirmationKey
} from "./preserveStudioPaidConfirmationKey.js"

import {
  retireStudioCheckoutAttempt
} from "./retireStudioCheckoutAttempt.js"

/**
 * Called only after server-verified paid confirmation.
 *
 * Preservation must succeed before retirement.
 * Never retire an interrupted or unmatched checkout.
 *
 * An archived confirmation key is not payment evidence.
 */
export function finalizeStudioPaidCheckout({
  storage,
  confirmation,
  orderId,
  attemptKey
} = {}) {
  const preserved = preserveStudioPaidConfirmationKey({
    storage,
    confirmation,
    expectedOrderId: orderId,
    expectedAttemptKey: attemptKey
  })

  if (!preserved) {
    return Object.freeze({
      preserved: false,
      retired: false
    })
  }

  const retired = retireStudioCheckoutAttempt({
    storage,
    confirmation,
    expectedOrderId: orderId,
    expectedAttemptKey: attemptKey
  })

  return Object.freeze({
    preserved: true,
    retired
  })
}