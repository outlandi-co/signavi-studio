export function getCustomizationKey(item = {}) {
  const value = item?.customization
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }
  return JSON.stringify(value)
}

export function matchesCustomizationSelection(item, selector) {
  const itemKey = getCustomizationKey(item)
  const selectedKey =
    selector &&
    typeof selector === "object" &&
    !Array.isArray(selector)
      ? selector.customizationKey ?? null
      : null

  return itemKey === selectedKey
}

export function totalMatchingPhysicalQuantity(cart, productId, variant) {
  return cart
    .filter((item) => {
      if (String(item.productId) !== String(productId)) return false
      if (String(item.productType || "physical") !== "physical") {
        return false
      }

      return (
        String(item.selectedVariant?.color || "") ===
          String(variant?.color || "") &&
        String(item.selectedVariant?.size || "") ===
          String(variant?.size || "")
      )
    })
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0)
}
