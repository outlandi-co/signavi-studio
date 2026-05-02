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

  /* ================= SYNC (cross-tab only) ================= */
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "cart") {
        try {
          setCart(e.newValue ? JSON.parse(e.newValue) : [])
        } catch {
          setCart([])
        }
      }
    }

    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener("storage", handleStorage)
    }
  }, [])

  /* ================= ADD ================= */
  const addToCart = (product) => {
    const variant = product.selectedVariant

    if (!variant?.color || !variant?.size) {
      console.warn("❌ Missing variant (color/size)")
      return
    }

    setCart(prev => {
      const existing = prev.find(item =>
        item.productId === product.productId &&
        item.selectedVariant?.color === variant.color &&
        item.selectedVariant?.size === variant.size
      )

      if (existing) {
        return prev.map(item =>
          item.productId === product.productId &&
          item.selectedVariant?.color === variant.color &&
          item.selectedVariant?.size === variant.size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [
        ...prev,
        {
          productId: product.productId,
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

  /* ================= UPDATE ================= */
  const updateQuantity = (index, qty) => {
    setCart(prev =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity: Math.max(1, qty) }
          : item
      )
    )
  }

  const updateQty = updateQuantity

  /* ================= CLEAR ================= */
  const clearCart = () => setCart([])

  /* ================= TOTAL ================= */
  const total = cart.reduce((sum, item) => {
    const quantity = Number(item?.quantity) || 1
    const price = Number(item?.selectedVariant?.price ?? 0)
    return sum + price * quantity
  }, 0)

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return {
    cart,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateQty,
    clearCart,
    total
  }
}