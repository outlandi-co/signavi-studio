const NONE = Object.freeze({
  clear: null,
  guestCheckout: false
})

function getPath(url) {
  if (typeof url !== "string") return ""

  try {
    return new URL(url, "http://localhost").pathname
      .replace(/^\/api(?=\/)/, "")
  } catch {
    return ""
  }
}

export function isGuestCheckoutRequest(method, url) {
  const path = getPath(url)
  const verb = String(method || "get").toLowerCase()

  return (
    (verb === "post" && path === "/orders") ||
    (verb === "post" &&
      path === "/orders/storefront/recover") ||
    (verb === "patch" &&
      /^\/orders\/[a-f0-9]{24}\/checkout$/i.test(path))
  )
}

export function decideUnauthorizedSession({
  method,
  url,
  authorization,
  adminToken,
  customerToken
} = {}) {
  if (isGuestCheckoutRequest(method, url)) {
    return { clear: null, guestCheckout: true }
  }

  const supplied =
    typeof authorization === "string"
      ? authorization.trim()
      : ""

  if (!supplied.startsWith("Bearer ")) return NONE

  const token = supplied.slice(7)

  if (!token) return NONE

  if (
    typeof adminToken === "string" &&
    adminToken.length > 0 &&
    token === adminToken
  ) {
    return { clear: "admin", guestCheckout: false }
  }

  if (
    typeof customerToken === "string" &&
    customerToken.length > 0 &&
    token === customerToken
  ) {
    return { clear: "customer", guestCheckout: false }
  }

  return NONE
}