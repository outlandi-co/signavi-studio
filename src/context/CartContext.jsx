import { createContext, useState, useEffect } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {

  /* ================= INIT ================= */
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
    const variant = product.selectedVariant

    if (!variant || !variant.color || !variant.size) {
      console.warn("❌ Missing variant")
      return
    }

    console.log("🛒 ADD:", product.name, variant)

    setCart(prev => {

      const existing = prev.find(item =>
        item.productId === product._id &&
        item.selectedVariant?.color === variant.color &&
        item.selectedVariant?.size === variant.size
      )

      if (existing) {
        return prev.map(item =>
          item.productId === product._id &&
          item.selectedVariant?.color === variant.color &&
          item.selectedVariant?.size === variant.size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          image: product.image,

          selectedVariant: {
            color: variant.color,
            size: variant.size,
            price: variant.price
          },

          quantity: 1
        }
      ]
    })
  }

  /* ================= REMOVE ================= */
  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index))
  }

  /* ================= UPDATE QTY ================= */
  const updateQuantity = (index, qty) => {
    if (qty <= 0) {
      removeFromCart(index)
      return
    }

    setCart(prev =>
      prev.map((item, i) =>
        i === index
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
    (sum, item) => {
      const price = Number(item?.selectedVariant?.price || 0)
      return sum + price * item.quantity
    },
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