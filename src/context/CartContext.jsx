import { createContext, useState, useEffect } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {

  /* ================= LOAD ================= */
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]")
    } catch {
      return []
    }
  })

  /* ================= SAVE ================= */
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  /* ================= ADD ================= */
  const addToCart = (product) => {
    const variant = product.selectedVariant
    const productId = product.productId || product._id

    /* 🔥 REQUIRED VARIANT */
    if (!variant?.color || !variant?.size) {
      console.warn("❌ Missing variant:", product)
      return
    }

    /* 🔥 SAFE PRICE */
    const price = parseFloat(variant.price || 0)

    if (!price || price <= 0) {
      console.warn("❌ Invalid price:", product)
      return
    }

    setCart(prev => {

      const existing = prev.find(item =>
        item.productId === productId &&
        item.selectedVariant.color === variant.color &&
        item.selectedVariant.size === variant.size
      )

      /* ================= EXISTS ================= */
      if (existing) {
        return prev.map(item =>
          item.productId === productId &&
          item.selectedVariant.color === variant.color &&
          item.selectedVariant.size === variant.size
            ? {
                ...item,
                quantity: item.quantity + 1
              }
            : item
        )
      }

      /* ================= NEW ITEM ================= */
      return [
        ...prev,
        {
          productId,
          name: product.name,
          image: product.image,

          selectedVariant: {
            color: variant.color,
            size: variant.size,
            price
          },

          quantity: 1
        }
      ]
    })
  }

  /* ================= UPDATE ================= */
  const updateQuantity = (productId, variant, delta) => {

    setCart(prev =>
      prev
        .map(item => {

          if (
            item.productId === productId &&
            item.selectedVariant.color === variant.color &&
            item.selectedVariant.size === variant.size
          ) {

            const newQty = item.quantity + delta

            /* 🔥 REMOVE IF 0 */
            if (newQty <= 0) return null

            return {
              ...item,
              quantity: newQty
            }
          }

          return item
        })

        .filter(Boolean)
    )
  }

  /* ================= REMOVE ================= */
  const removeFromCart = (productId, variant) => {

    setCart(prev =>
      prev.filter(item =>
        !(
          item.productId === productId &&
          item.selectedVariant.color === variant.color &&
          item.selectedVariant.size === variant.size
        )
      )
    )
  }

  /* ================= TOTALS ================= */

  const subtotal = cart.reduce((sum, item) => {

    const price = parseFloat(
      item.selectedVariant?.price || 0
    )

    return sum + (price * item.quantity)

  }, 0)

  const tax = subtotal * 0.0825

  const shipping = 0

  const total = subtotal + tax + shipping

  /* ================= CART COUNT ================= */

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,

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