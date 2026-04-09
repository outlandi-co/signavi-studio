import { useState } from "react"
import CartContext from "./CartContext"

export function CartProvider({ children }) {

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]")
    } catch {
      return []
    }
  })

  const saveCart = (newCart) => {
    setCart(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
  }

  const addToCart = (product) => {
    const existing = cart.find(i => i._id === product._id)

    let updated

    if (existing) {
      updated = cart.map(i =>
        i._id === product._id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    } else {
      updated = [...cart, { ...product, quantity: 1 }]
    }

    saveCart(updated)
  }

  const removeFromCart = (id) => {
    saveCart(cart.filter(i => i._id !== id))
  }

  const clearCart = () => {
    saveCart([])
  }

  const updateQuantity = (id, qty) => {
    if (qty <= 0) return removeFromCart(id)

    const updated = cart.map(i =>
      i._id === id ? { ...i, quantity: qty } : i
    )

    saveCart(updated)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  )
}