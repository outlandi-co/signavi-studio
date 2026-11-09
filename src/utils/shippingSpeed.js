export function getShippingSpeedLabel(rate = {}) {
  const name = String(
    rate.servicelevel ||
    rate.service ||
    rate.serviceName ||
    rate.name ||
    ""
  ).toLowerCase()

  if (/overnight|next[ -]?day|1[ -]?day/.test(name)) {
    return "Overnight"
  }

  if (/2nd[ -]?day|2[ -]?day|two[ -]?day|3[ -]?day|three[ -]?day|express|expedited/.test(name)) {
    return "Expedited"
  }

  if (/ground advantage|economy|media mail|surepost|smartpost/.test(name)) {
    return "Economy"
  }

  if (/ground|priority mail|standard|first.class/.test(name)) {
    return "Standard"
  }

  return "Carrier service"
}
