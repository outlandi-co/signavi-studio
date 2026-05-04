import { createContext, useState, useEffect } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]")
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    const variant = product.selectedVariant

    const price = Number(variant?.price || 0)

    if (!price || price <= 0) {
      console.error("❌ INVALID PRICE BLOCKED:", product)
      return
    }

    setCart(prev => {
      const existing = prev.find(item =>
        item.productId === product.productId &&
        item.selectedVariant.color === variant.color &&
        item.selectedVariant.size === variant.size
      )

      if (existing) {
        return prev.map(item =>
          item.productId === product.productId &&
          item.selectedVariant.color === variant.color &&
          item.selectedVariant.size === variant.size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [
        ...prev,
        {
          productId: product.productId,
          name: product.name,
          image: product.image,
          selectedVariant: {
            color: variant.color,
            size: variant.size,
            price // 🔥 GUARANTEED
          },
          quantity: 1
        }
      ]
    })
  }

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
            if (newQty <= 0) return null
            return { ...item, quantity: newQty }
          }
          return item
        })
        .filter(Boolean)
    )
  }

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

  const subtotal = cart.reduce((sum, item) => {
    const price = Number(item.selectedVariant?.price || 0)
    return sum + price * item.quantity
  }, 0)

  const tax = subtotal * 0.0825
  const shipping = 0
  const total = subtotal + tax + shipping

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
        total
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export default CartContext