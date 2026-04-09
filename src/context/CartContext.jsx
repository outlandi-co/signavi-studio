import { createContext, useState, useEffect } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  /* ================= PERSIST ================= */
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  /* ================= ADD ================= */
  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(p => p._id === product._id)

      if (exists) {
        return prev.map(p =>
          p._id === product._id
            ? { ...p, quantity: (p.quantity || 1) + 1 }
            : p
        )
      }

      return [...prev, { ...product, quantity: 1 }]
    })
  }

  /* ================= REMOVE ================= */
  const removeFromCart = (id) => {
    setCart(prev =>
      prev
        .map(p =>
          p._id === id
            ? { ...p, quantity: (p.quantity || 1) - 1 }
            : p
        )
        .filter(p => p.quantity > 0)
    )
  }

  const clearCart = () => setCart([])

  const cartCount = cart.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  )

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        clearCart,
        cartCount
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export default CartContext

