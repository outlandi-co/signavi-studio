const normalize = value =>
  typeof value === "string"
    ? value.trim()
    : ""

const amountInCents = value => {
  const text = String(value ?? "").trim()

  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) return null

  const [dollars, fraction = ""] = text.split(".")
  const cents = Number(dollars) * 100 +
    Number(fraction.padEnd(2, "0"))

  return Number.isSafeInteger(cents) && cents > 0
    ? cents
    : null
}

export function extractV3ShippingSelection(selectedRate) {
  if (!selectedRate || typeof selectedRate !== "object") {
    return null
  }

  const raw = selectedRate.raw

  // Require the original carrier rate, not a display-only label.
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null
  }

  const carrier = normalize(raw.provider || raw.carrier)
  const serviceToken = normalize(
    raw.servicelevel?.token || raw.serviceToken
  )
  const currency = normalize(raw.currency).toUpperCase()

  const originalAmount = amountInCents(raw.amount)
  const displayedAmount = amountInCents(selectedRate.amount)

  if (
    !carrier ||
    !serviceToken ||
    !/^[A-Z]{3}$/.test(currency) ||
    originalAmount === null ||
    displayedAmount === null ||
    originalAmount !== displayedAmount
  ) {
    return null
  }

  return Object.freeze({
    carrier,
    serviceToken,
    currency,
    amount: (originalAmount / 100).toFixed(2)
  })
}