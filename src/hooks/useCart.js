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
  const total = cart.reduce((sum, item) => {
    const quantity = Number(item?.quantity) || 1

    const price = Number(
      item?.variant?.price ??
      item?.price ?? // fallback for old cart items
      0
    )

    return sum + price * quantity
  }, 0)

  /* ================= RETURN (🔥 MISSING BEFORE) ================= */
  return {
    cart,
    addToCart,
    removeFromCart,
    updateQty,
    total
  }
}