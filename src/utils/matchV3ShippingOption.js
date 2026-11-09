const cents = value => {
  const text = String(value ?? "").trim()

  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) {
    return null
  }

  const [dollars, fraction = ""] = text.split(".")
  const result =
    Number(dollars) * 100 +
    Number(fraction.padEnd(2, "0"))

  return Number.isSafeInteger(result) && result > 0
    ? result
    : null
}

const normalized = value =>
  typeof value === "string"
    ? value.trim().toLowerCase()
    : ""

export function matchV3ShippingOption({
  selected,
  options
}) {
  if (!selected || !Array.isArray(options)) {
    return null
  }

  const carrier = normalized(selected.carrier)
  const serviceToken = normalized(selected.serviceToken)
  const currency = normalized(selected.currency)
  const amountCents = cents(selected.amount)

  if (
    !carrier ||
    !serviceToken ||
    !currency ||
    amountCents === null
  ) {
    return null
  }

  const matches = options.filter(option =>
    normalized(option?.carrier) === carrier &&
    normalized(option?.serviceToken) === serviceToken &&
    normalized(option?.currency) === currency &&
    cents(option?.amount) === amountCents &&
    typeof option?.signedQuote === "string" &&
    option.signedQuote.trim().length > 0
  )

  return matches.length === 1 ? matches[0] : null
}