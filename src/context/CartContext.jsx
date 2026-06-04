import { createContext, useEffect, useMemo, useState } from "react"

const CartContext = createContext()

const TAX_RATE = 0.0825

const safeNumber = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const getProductId = (product = {}) => {
  return product.productId || product._id || product.id || ""
}

const getProductType = (product = {}) => {
  return product.productType || product.type || "physical"
}

const getCartItemPrice = (item = {}) => {
  return safeNumber(
    item.salePrice ??
      item.finalPrice ??
      item.unitPrice ??
      item.price ??
      item.selectedVariant?.price ??
      item.basePrice ??
      item.listPrice ??
      0
  )
}

const normalizeVariant = (variant = null) => {
  if (!variant) return null

  return {
    color: variant.color || "",
    size: variant.size || "",
    price: safeNumber(variant.price)
  }
}

const isSameCartItem = (item = {}, product = {}) => {
  const productId = getProductId(product)
  const productType = getProductType(product)

  if (item.productId !== productId) return false

  if (productType === "digital" || productType === "service") {
    return item.productType === productType
  }

  const variant = product.selectedVariant || null

  if (!variant) {
    return !item.selectedVariant
  }

  return (
    item.selectedVariant?.color === variant?.color &&
    item.selectedVariant?.size === variant?.size
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

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (product = {}) => {
    const productId = getProductId(product)
    const productType = getProductType(product)
    const variant = normalizeVariant(product.selectedVariant || null)

    if (!productId) {
      console.warn("❌ Missing product ID:", product)
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
      console.warn("❌ Invalid price:", product)
      return false
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

      selectedVariant:
        productType === "physical" && variant
          ? {
              color: variant.color,
              size: variant.size,
              price
            }
          : null,

      digitalProduct:
        productType === "digital"
          ? product.digitalProduct || null
          : null
    }

    setCart((prev) => {
      const existing = prev.find((item) => isSameCartItem(item, product))

      if (existing) {
        return prev.map((item) => {
          if (!isSameCartItem(item, product)) return item

          if (productType === "digital") {
            return {
              ...item,
              ...cartPayload,
              quantity: 1,
              digitalProduct:
                product.digitalProduct || item.digitalProduct || null
            }
          }

          return {
            ...item,
            ...cartPayload,
            quantity: safeNumber(item.quantity, 1) + safeNumber(product.quantity, 1)
          }
        })
      }

      return [
        ...prev,
        {
          ...cartPayload,
          quantity: safeNumber(product.quantity, 1)
        }
      ]
    })

    return true
  }

  const updateQuantity = (productId, variantOrType, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item

          const itemType = item.productType || "physical"

          const isMatch =
            itemType === "digital" || itemType === "service"
              ? itemType === variantOrType
              : !variantOrType ||
                (
                  item.selectedVariant?.color === variantOrType?.color &&
                  item.selectedVariant?.size === variantOrType?.size
                )

          if (!isMatch) return item

          if (itemType === "digital" && delta > 0) {
            return {
              ...item,
              quantity: 1
            }
          }

          const newQty = safeNumber(item.quantity, 1) + delta

          if (newQty <= 0) return null

          return {
            ...item,
            quantity: newQty
          }
        })
        .filter(Boolean)
    )
  }

  const removeFromCart = (productId, variantOrType = null) => {
    setCart((prev) =>
      prev.filter((item) => {
        if (item.productId !== productId) return true

        const itemType = item.productType || "physical"

        if (itemType === "digital" || itemType === "service") {
          return itemType !== variantOrType
        }

        if (!variantOrType) {
          return false
        }

        return !(
          item.selectedVariant?.color === variantOrType?.color &&
          item.selectedVariant?.size === variantOrType?.size
        )
      })
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = getCartItemPrice(item)
      const quantity = safeNumber(item.quantity, 1)

      return sum + price * quantity
    }, 0)
  }, [cart])

  const tax = useMemo(() => {
    return subtotal * TAX_RATE
  }, [subtotal])

  const shipping = 0

  const total = useMemo(() => {
    return subtotal + tax + shipping
  }, [subtotal, tax])

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