import { useState, useEffect } from "react"

export default function useCart() {

  /* ================= INIT (🔥 FIXED) ================= */
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart")
      return saved ? JSON.parse(saved) : []
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
    if (!variant) return

    setCart(prev => {
      const existing = prev.find(item =>
        item.productId === product._id &&
        item.variant.color === variant.color &&
        item.variant.size === variant.size
      )

      if (existing) {
        return prev.map(item =>
          item === existing
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
          variant,
          quantity: 1
        }
      ]
    })
  }

  /* ================= REMOVE ================= */
  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index))
  }

  /* ================= UPDATE ================= */
  const updateQty = (index, qty) => {
    setCart(prev =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity: Math.max(1, qty) }
          : item
      )
    )
  }

  /* ================= TOTAL ================= */
  const total = cart.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  )

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQty,
    total
  }
}