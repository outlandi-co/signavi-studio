const STORAGE_KEY = "signavi:studio:checkout-attempt:v1"

function toBase64Url(bytes) {
  let binary = ""

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

async function fingerprintPayload(payload) {
  const json = JSON.stringify(payload)

  if (typeof json !== "string") {
    throw new Error("Checkout payload is invalid.")
  }

  const bytes = new TextEncoder().encode(json)
  const digest = await crypto.subtle.digest("SHA-256", bytes)

  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("")
}

export async function getStorefrontCheckoutAttempt(payload) {
  if (!crypto?.randomUUID ||
      !crypto?.getRandomValues ||
      !crypto?.subtle) {
    throw new Error("Secure checkout is unavailable in this browser.")
  }

  const fingerprint = await fingerprintPayload(payload)
  const existingRaw = sessionStorage.getItem(STORAGE_KEY)

  if (existingRaw !== null) {
    let existing

    try {
      existing = JSON.parse(existingRaw)
    } catch {
      throw new Error(
        "Existing checkout attempt cannot be verified. Contact support."
      )
    }

    if (
      typeof existing?.attemptKey !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        existing.attemptKey
      ) ||
      typeof existing?.recoverySecret !== "string" ||
      !/^[A-Za-z0-9_-]{43}$/.test(existing.recoverySecret) ||
      typeof existing?.fingerprint !== "string" ||
      !/^[a-f0-9]{64}$/.test(existing.fingerprint)
    ) {
      throw new Error(
        "Existing checkout credentials are invalid. Contact support."
      )
    }

    if (existing.fingerprint !== fingerprint) {
      throw new Error(
        "Your checkout details changed during an existing purchase attempt. " +
        "Contact support before starting another attempt."
      )
    }

    return {
      attemptKey: existing.attemptKey,
      recoverySecret: existing.recoverySecret
    }
  }

  const attemptKey = crypto.randomUUID().toLowerCase()

  const random = new Uint8Array(32)
  crypto.getRandomValues(random)

  const recoverySecret = toBase64Url(random)

  if (recoverySecret.length !== 43) {
    throw new Error("Unable to generate secure checkout credentials.")
  }

  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      attemptKey,
      recoverySecret,
      fingerprint
    })
  )

  return {
    attemptKey,
    recoverySecret
  }
}

export function storefrontCheckoutHeaders(attempt) {
  if (!attempt?.attemptKey || !attempt?.recoverySecret) {
    throw new Error("Checkout credentials are missing.")
  }

  return {
    "x-signavi-storefront-attempt-key": attempt.attemptKey,
    "x-signavi-storefront-recovery-secret": attempt.recoverySecret
  }
}
