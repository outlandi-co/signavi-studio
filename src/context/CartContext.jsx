import { createContext, useEffect, useMemo, useRef, useState } from "react"

const CartContext = createContext()
const TAX_RATE = 0.0825

const safeNumber = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const getProductId = (product = {}) =>
  product.productId || product._id || product.id || ""

const getProductType = (product = {}) =>
  String(product.productType || product.type || "physical").toLowerCase()

const getCartItemPrice = (item = {}) =>
  safeNumber(
    item.salePrice ??
      item.finalPrice ??
      item.unitPrice ??
      item.price ??
      item.selectedVariant?.price ??
      item.basePrice ??
      item.listPrice ??
      0
  )

// null means inventory was not supplied. Zero means out of stock.
// Never treat a requested cart quantity as the product's stock.
const parseStock = (value) => {
  if (value === null || value === undefined || value === "") return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0
    ? Math.floor(number)
    : 0
}

const normalizeVariant = (variant = null) => {
  if (!variant) return null

  return {
    color: variant.color || "",
    size: variant.size || "",
    price: safeNumber(variant.price),
    // For a size/color variant, quantity is the inventory field.
    stock: parseStock(
      variant.stock ?? variant.quantity ?? variant.availableStock
    )
  }
}

const getIncomingStock = (product, variant) => {
  const productVariants = Array.isArray(product.variants)
    ? product.variants
    : []

  if (productVariants.length > 0) {
    // Never fall back to another size/color or to total parent stock.
    if (!variant) return null
    const exactVariant = productVariants.find(
      (option) =>
        String(option.color || "") === String(variant.color || "") &&
        String(option.size || "") === String(variant.size || "")
    )
    return exactVariant
      ? parseStock(
          exactVariant.stock ?? exactVariant.quantity ?? exactVariant.availableStock
        )
      : null
  }

  if (variant) return variant.stock

  // product.quantity means the number requested when calling addToCart,
  // not the available inventory. Callers must supply product.stock.
  return parseStock(product.stock ?? product.availableStock)
}

const isSameCartItem = (item = {}, product = {}) => {
  const productId = getProductId(product)
  const productType = getProductType(product)

  if (String(item.productId) !== String(productId)) return false

  if (productType === "digital" || productType === "service") {
    return getProductType(item) === productType
  }

  const variant = product.selectedVariant || null
  if (!variant) return !item.selectedVariant

  return (
    item.selectedVariant?.color === variant.color &&
    item.selectedVariant?.size === variant.size
  )
}

const isMatchingQuantityItem = (item, productId, variantOrType) => {
  if (String(item.productId) !== String(productId)) return false

  const type = getProductType(item)
  if (type === "digital" || type === "service") {
    return type === variantOrType
  }

  if (!variantOrType) return true // preserve existing cart-drawer API

  return (
    item.selectedVariant?.color === variantOrType?.color &&
    item.selectedVariant?.size === variantOrType?.size
  )
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]")
      return Array.isArray(savedCart) ? savedCart : []
    } catch {
      return []
    }
  })

  // Keep a synchronized snapshot so addToCart can return a reliable boolean,
  // even when a user clicks quickly before React finishes re-rendering.
  const cartRef = useRef(cart)

  const saveCart = (nextCart) => {
    cartRef.current = nextCart
    setCart(nextCart)
  }

  useEffect(() => {
    cartRef.current = cart
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (product = {}) => {
    const productId = getProductId(product)
    const productType = getProductType(product)
    const variant = normalizeVariant(product.selectedVariant || null)

    if (!productId) {
      console.warn("Missing product ID:", product)
      return false
    }

    const price = safeNumber(
      product.salePrice ??
        product.finalPrice ??
        product.unitPrice ??
        product.price ??
        variant?.price ??
        product.basePrice ??
        product.listPrice ??
        0
    )

    if (price <= 0) {
      console.warn("Invalid product price:", product)
      return false
    }

    const requestedQty = safeNumber(product.quantity ?? 1, 1)
    if (!Number.isInteger(requestedQty) || requestedQty < 1) {
      console.warn("Invalid cart quantity:", product.quantity)
      return false
    }

    const stock = getIncomingStock(product, variant)

    if (productType === "physical") {
      if (
        Array.isArray(product.variants) &&
        product.variants.length > 0 &&
        !variant
      ) {
        console.warn("Choose a product variant before adding to cart")
        return false
      }

      // Fail closed if the caller did not supply stock information.
      // ProductDetail must pass stock for products without variants.
      if (stock === null || stock <= 0 || requestedQty > stock) {
        console.warn("Product is unavailable or inventory was not supplied")
        return false
      }
    }

    const originalPrice = safeNumber(
      product.originalPrice ??
        product.regularPrice ??
        product.compareAtPrice ??
        product.listPrice ??
        product.basePrice ??
        price
    )

    const cartPayload = {
      productId,
      name: product.name || "Untitled Product",
      image: product.image || "",
      productType,

      price,
      unitPrice: price,
      salePrice: price,
      finalPrice: price,

      originalPrice,
      regularPrice: originalPrice,
      compareAtPrice: originalPrice,
      listPrice: price,
      basePrice: price,

      discountActive: Boolean(product.discountActive),
      discountType: product.discountType || "",
      discountValue: safeNumber(product.discountValue, 0),
      discountLabel: product.discountLabel || "",

      // Snapshot of the stock used for add/increment checks, not a live promise.
      stock: productType === "physical" ? stock : null,
      selectedVariant:
        productType === "physical" && variant
          ? {
              color: variant.color,
              size: variant.size,
              price,
              stock: variant.stock
            }
          : null,

      digitalProduct:
        productType === "digital"
          ? product.digitalProduct || null
          : null
    }

    const previous = cartRef.current
    const existing = previous.find((item) => isSameCartItem(item, product))
    const existingQty = existing ? safeNumber(existing.quantity, 1) : 0
    const newQty = productType === "digital" ? 1 : existingQty + requestedQty

    if (productType === "physical" && newQty > stock) {
      console.warn(`Only ${stock} available; requested ${newQty}`)
      return false
    }

    if (existing) {
      saveCart(
        previous.map((item) => {
          if (!isSameCartItem(item, product)) return item

          return {
            ...item,
            ...cartPayload,
            quantity: newQty,
            digitalProduct:
              productType === "digital"
                ? product.digitalProduct || item.digitalProduct || null
                : null
          }
        })
      )
    } else {
      saveCart([...previous, { ...cartPayload, quantity: newQty }])
    }

    return true
  }

  const updateQuantity = (productId, variantOrType, delta) => {
    const amount = Number(delta)
    if (!Number.isInteger(amount) || amount === 0) return false

    let changed = false

    const updated = cartRef.current
      .map((item) => {
        if (!isMatchingQuantityItem(item, productId, variantOrType)) {
          return item
        }

        const type = getProductType(item)
        if (type === "digital" && amount > 0) return item

        const currentQty = safeNumber(item.quantity, 1)
        const nextQty = currentQty + amount

        if (nextQty <= 0) {
          changed = true
          return null
        }

        if (type === "physical" && amount > 0) {
          const stock = parseStock(
            item.stock ?? item.selectedVariant?.stock
          )

          // Old carts may lack stock. Do not allow an unverified increase.
          if (stock === null || stock <= 0 || nextQty > stock) {
            return item
          }
        }

        changed = true
        return { ...item, quantity: nextQty }
      })
      .filter(Boolean)

    if (changed) saveCart(updated)
    return changed
  }

  const removeFromCart = (productId, variantOrType = null) => {
    const updated = cartRef.current.filter((item) => {
      if (String(item.productId) !== String(productId)) return true

      const itemType = getProductType(item)

      if (itemType === "digital" || itemType === "service") {
        return variantOrType != null && itemType !== variantOrType
      }

      if (!variantOrType) return false

      return !(
        item.selectedVariant?.color === variantOrType?.color &&
        item.selectedVariant?.size === variantOrType?.size
      )
    })

    saveCart(updated)
  }

  const clearCart = () => saveCart([])

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = getCartItemPrice(item)
      const quantity = safeNumber(item.quantity, 1)
      return sum + price * quantity
    }, 0)
  }, [cart])

  const tax = useMemo(() => subtotal * TAX_RATE, [subtotal])
  const shipping = 0
  const total = useMemo(() => subtotal + tax + shipping, [subtotal, tax])

  const cartCount = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + safeNumber(item.quantity, 1),
      0
    )
  }, [cart])

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        tax,
        shipping,
        total,
        cartCount
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export default CartContext
