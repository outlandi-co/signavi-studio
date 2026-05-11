import { createContext, useState, useEffect } from "react"

const CartContext = createContext()

const getProductId = (product) => {
  return product.productId || product._id
}

const getProductType = (product) => {
  return product.productType || "physical"
}

const getCartItemPrice = (item) => {
  return Number(
    item.price ||
    item.selectedVariant?.price ||
    item.digitalProduct?.price ||
    0
  )
}

const isSameCartItem = (item, product) => {
  const productId = getProductId(product)
  const productType = getProductType(product)

  if (item.productId !== productId) return false

  // Digital/service products do not need color/size matching
  if (productType === "digital" || productType === "service") {
    return item.productType === productType
  }

  const variant = product.selectedVariant

  return (
    item.selectedVariant?.color === variant?.color &&
    item.selectedVariant?.size === variant?.size
  )
}

export function CartProvider({ children }) {
  /* ================= LOAD ================= */

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]")
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
    const productId = getProductId(product)
    const productType = getProductType(product)
    const variant = product.selectedVariant || null

    if (!productId) {
      console.warn("❌ Missing product ID:", product)
      return
    }

    // Physical products still need color + size
    if (productType === "physical") {
      if (!variant?.color || !variant?.size) {
        console.warn("❌ Missing variant:", product)
        return
      }
    }

    const price = Number(
      product.price ||
      variant?.price ||
      product.basePrice ||
      product.listPrice ||
      0
    )

    if (!price || price <= 0) {
      console.warn("❌ Invalid price:", product)
      return
    }

    setCart(prev => {
      const existing = prev.find(item => isSameCartItem(item, product))

      /* ================= EXISTS ================= */

      if (existing) {
        return prev.map(item => {
          if (!isSameCartItem(item, product)) return item

          // Digital products usually stay quantity 1
          if (productType === "digital") {
            return {
              ...item,
              quantity: 1,
              price
            }
          }

          return {
            ...item,
            quantity: Number(item.quantity || 1) + 1,
            price
          }
        })
      }

      /* ================= NEW ITEM ================= */

      return [
        ...prev,
        {
          productId,
          name: product.name,
          image: product.image,
          productType,
          price,

          selectedVariant: productType === "physical"
            ? {
                color: variant.color,
                size: variant.size,
                price
              }
            : null,

          digitalProduct: productType === "digital"
            ? product.digitalProduct || null
            : null,

          quantity: 1
        }
      ]
    })
  }

  /* ================= UPDATE ================= */

  const updateQuantity = (productId, variantOrType, delta) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.productId !== productId) return item

          const itemType = item.productType || "physical"

          const isMatch =
            itemType === "digital" || itemType === "service"
              ? variantOrType === itemType || !variantOrType
              : (
                  item.selectedVariant?.color === variantOrType?.color &&
                  item.selectedVariant?.size === variantOrType?.size
                )

          if (!isMatch) return item

          // Keep digital products locked at 1 for now
          if (itemType === "digital" && delta > 0) {
            return {
              ...item,
              quantity: 1
            }
          }

          const newQty = Number(item.quantity || 1) + delta

          if (newQty <= 0) return null

          return {
            ...item,
            quantity: newQty
          }
        })
        .filter(Boolean)
    )
  }

  /* ================= REMOVE ================= */

  const removeFromCart = (productId, variantOrType) => {
    setCart(prev =>
      prev.filter(item => {
        if (item.productId !== productId) return true

        const itemType = item.productType || "physical"

        if (itemType === "digital" || itemType === "service") {
          return !(variantOrType === itemType || !variantOrType)
        }

        return !(
          item.selectedVariant?.color === variantOrType?.color &&
          item.selectedVariant?.size === variantOrType?.size
        )
      })
    )
  }

  /* ================= CLEAR ================= */

  const clearCart = () => {
    setCart([])
  }

  /* ================= TOTALS ================= */

  const subtotal = cart.reduce((sum, item) => {
    const price = getCartItemPrice(item)
    const quantity = Number(item.quantity || 1)

    return sum + price * quantity
  }, 0)

  const tax = subtotal * 0.0825

  const shipping = 0

  const total = subtotal + tax + shipping

  /* ================= CART COUNT ================= */

  const cartCount = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0
  )

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,

        subtotal,
        tax,
        shipping,
        total,

        cartCount
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export default CartContext