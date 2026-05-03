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
    const productId = product.productId || product._id

    if (!variant?.color || !variant?.size) return

    setCart(prev => {
      const existing = prev.find(item =>
        item.productId === productId &&
        item.selectedVariant.color === variant.color &&
        item.selectedVariant.size === variant.size
      )

      if (existing) {
        return prev.map(item =>
          item.productId === productId &&
          item.selectedVariant.color === variant.color &&
          item.selectedVariant.size === variant.size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [
        ...prev,
        {
          productId,
          name: product.name,
          image: product.image,
          selectedVariant: {
            color: variant.color,
            size: variant.size,
            price: Number(variant.price || 0)
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
    const qty = Number(item.quantity || 1)
    return sum + price * qty
  }, 0)

  const tax = subtotal * 0.0825
  const total = subtotal + tax

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        subtotal,
        tax,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export default CartContext