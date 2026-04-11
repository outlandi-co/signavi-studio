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
    console.log("🛒 ADD TO CART:", product)

    setCart(prev => {
      const exists = prev.find(item => item._id === product._id)

      if (exists) {
        return prev.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...prev, { ...product, quantity: 1 }]
    })
  }

  /* ================= REMOVE ================= */
  const removeFromCart = (id) => {
    setCart(prev =>
      prev.filter(item => item._id !== id)
    )
  }

  /* ================= UPDATE QTY ================= */
  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id)
      return
    }

    setCart(prev =>
      prev.map(item =>
        item._id === id
          ? { ...item, quantity: qty }
          : item
      )
    )
  }

  /* ================= CLEAR ================= */
  const clearCart = () => {
    setCart([])
  }

  /* ================= COUNT ================= */
  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  /* ================= TOTAL ================= */
  const cartTotal = cart.reduce(
    (sum, item) =>
      sum + (item.price || item.basePrice || 0) * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export default CartContext