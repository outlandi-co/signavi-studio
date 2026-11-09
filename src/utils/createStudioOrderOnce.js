import {
  storefrontCheckoutHeaders
} from "./storefrontCheckoutAttempt.js"

import {
  classifyStudioOrderCreationResponse,
  classifyStudioOrderCreationError
} from "./classifyStudioOrderCreation.js"

/**
 * Makes at most one Studio order-creation request.
 *
 * No retry, recovery request, payment request, navigation,
 * or browser-storage mutation occurs here.
 */
export async function createStudioOrderOnce({
  api,
  orderPayload,
  attempt
} = {}) {
  if (
    typeof api?.post !== "function" ||
    !orderPayload ||
    typeof orderPayload !== "object" ||
    Array.isArray(orderPayload) ||
    orderPayload.storefront !== "signavi_studio" ||
    typeof attempt?.attemptKey !== "string" ||
    typeof attempt?.recoverySecret !== "string"
  ) {
    return Object.freeze({
      kind: "rejected",
      reason: "invalid_request",
      canCreateAnotherOrder: false
    })
  }

  let headers

  try {
    headers = storefrontCheckoutHeaders(attempt)
  } catch {
    return Object.freeze({
      kind: "rejected",
      reason: "invalid_credentials",
      canCreateAnotherOrder: false
    })
  }

  try {
    const response = await api.post(
      "/orders",
      orderPayload,
      { headers }
    )

    return classifyStudioOrderCreationResponse(response)
  } catch (error) {
    return classifyStudioOrderCreationError(error)
  }
}