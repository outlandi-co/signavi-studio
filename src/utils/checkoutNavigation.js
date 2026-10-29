/**
 * Approved Square-hosted checkout destinations.
 *
 * This validates destination syntax and hostnames only.
 * Server-side payment authorization and order binding
 * remain mandatory.
 */
const APPROVED_HOSTS = new Set([
  "square.link",
  "checkout.square.site"
])

export function isApprovedSquareCheckoutUrl(paymentUrl) {
  if (typeof paymentUrl !== "string") return false

  if (
    paymentUrl !== paymentUrl.trim() ||
    /[\u0000-\u001F\u007F\\]/.test(paymentUrl)
  ) {
    return false
  }

  try {
    const url = new URL(paymentUrl)

    if (url.protocol !== "https:") return false
    if (!APPROVED_HOSTS.has(url.hostname)) return false
    if (url.username || url.password) return false
    if (url.port || url.hash) return false

    if (url.hostname === "square.link") {
      return /^\/u\/[^/]+$/.test(url.pathname)
    }

    if (url.hostname === "checkout.square.site") {
      return /^\/[^/]+$/.test(url.pathname)
    }

    return false
  } catch {
    return false
  }
}

export function redirectToCheckoutPayment(paymentUrl) {
  if (!isApprovedSquareCheckoutUrl(paymentUrl)) {
    throw new Error(
      "Secure Square payment URL was not returned."
    )
  }

  window.location.assign(paymentUrl)
}