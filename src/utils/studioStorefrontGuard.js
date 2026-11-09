export const STUDIO_STOREFRONT = "signavi_studio"

export function isStudioProduct(product) {
  return Boolean(
    product &&
    typeof product === "object" &&
    !Array.isArray(product) &&
    product.storefront === STUDIO_STOREFRONT
  )
}

export function isStudioCheckoutCart(cart) {
  return (
    Array.isArray(cart) &&
    cart.length > 0 &&
    cart.every(isStudioProduct)
  )
}
