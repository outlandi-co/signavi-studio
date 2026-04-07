import { useState, useEffect } from "react"
import { CartContext } from "./CartContext"

const STORAGE_KEY = "signavi_cart"

export function CartProvider({ children }) {

  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    if (!product?._id) return

    setCart(prev => {
      const existing = prev.find(p => p._id === product._id)

      if (existing) {
        return prev.map(p =>
          p._id === product._id
            ? { ...p, quantity: (p.quantity || 1) + 1 }
            : p
        )
      }

      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(p => p._id !== id))
  }

  const updateQuantity = (id, qty) => {
    if (qty < 1) return

    setCart(prev =>
      prev.map(p =>
        p._id === id ? { ...p, quantity: qty } : p
      )
    )
  }

  const clearCart = () => setCart([])

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}