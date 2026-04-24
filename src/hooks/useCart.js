import { useState, useEffect } from "react"

export default function useCart() {

  /* ================= INIT ================= */
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

    // ✅ FIXED: remove _id check
    if (!variant || !variant.color || !variant.size) {
      console.warn("❌ Missing variant (color/size)")
      return
    }

    setCart(prev => {

      // ✅ FIXED: match by color + size
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

          /* 🔥 NO _id */
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

  /* ================= CLEAR ================= */
  const clearCart = () => setCart([])

  /* ================= TOTAL ================= */
  const total = cart.reduce((sum, item) => {
    const quantity = Number(item?.quantity) || 1

    const price = Number(
      item?.selectedVariant?.price ?? 0
    )

    return sum + price * quantity
  }, 0)

  /* ================= RETURN ================= */
  return {
    cart,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    total
  }
}