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

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    const variant = product.selectedVariant

    if (!variant?.color || !variant?.size) {
      console.warn("❌ Missing variant")
      return
    }

    const productId = product.productId || product._id

    setCart(prev => {

      const existing = prev.find(item =>
        item.productId === productId &&
        item.selectedVariant?.color === variant.color &&
        item.selectedVariant?.size === variant.size
      )

      if (existing) {
        return prev.map(item =>
          item.productId === productId &&
          item.selectedVariant?.color === variant.color &&
          item.selectedVariant?.size === variant.size
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

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index))
  }

  const updateQuantity = (index, qty) => {
    setCart(prev =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity: Math.max(1, qty) }
          : item
      )
    )
  }

  const clearCart = () => setCart([])

  const subtotal = cart.reduce((sum, item) => {
    const price = Number(item?.selectedVariant?.price || 0)
    const qty = Number(item?.quantity || 1)
    return sum + price * qty
  }, 0)

  const tax = subtotal * 0.0825
  const total = subtotal + tax

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
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

/* ✅ ADD THIS BACK */


export default CartContext