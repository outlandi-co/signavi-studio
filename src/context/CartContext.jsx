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

    const productId = product.productId || product._id

    const incomingColor = String(variant.color).trim().toLowerCase()
    const incomingSize = String(variant.size).trim().toUpperCase()

    console.log("🛒 ADD:", product.name, variant)

    setCart(prev => {

      const existing = prev.find(item => {
        const itemColor = String(item.selectedVariant?.color || "").trim().toLowerCase()
        const itemSize = String(item.selectedVariant?.size || "").trim().toUpperCase()

        return (
          (item.productId || item._id) === productId &&
          itemColor === incomingColor &&
          itemSize === incomingSize
        )
      })

      if (existing) {
        return prev.map(item => {
          const itemColor = String(item.selectedVariant?.color || "").trim().toLowerCase()
          const itemSize = String(item.selectedVariant?.size || "").trim().toUpperCase()

          return (
            (item.productId || item._id) === productId &&
            itemColor === incomingColor &&
            itemSize === incomingSize
          )
            ? { ...item, quantity: item.quantity + 1 }
            : item
        })
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
            price: variant.price
          },

          quantity: 1
        }
      ]
    })
  }

  /* ================= REMOVE ================= */
  const removeFromCart = (id) => {
    setCart(prev =>
      prev.filter(item => (item.productId || item._id) !== id)
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
        (item.productId || item._id) === id
          ? { ...item, quantity: qty }
          : item
      )
    )
  }

  /* ================= CLEAR ================= */
  const clearCart = () => {
    setCart([])
    localStorage.removeItem("cart")
  }

  /* ================= TOTALS ================= */
  const subtotal = cart.reduce((sum, item) => {
    const price = Number(item?.selectedVariant?.price || 0)
    const qty = Number(item?.quantity || 1)
    return sum + price * qty
  }, 0)

  const taxRate = 0.0825
  const tax = subtotal * taxRate
  const total = subtotal + tax

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,

        /* 🔥 totals */
        subtotal,
        tax,
        total,

        cartCount
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export default CartContext