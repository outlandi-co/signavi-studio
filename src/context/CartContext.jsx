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
    0
  )
}

const isSameCartItem = (item, product) => {
  const productId = getProductId(product)
  const productType = getProductType(product)

  if (item.productId !== productId) return false

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
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]")
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    const productId = getProductId(product)
    const productType = getProductType(product)
    const variant = product.selectedVariant || null

    if (!productId) {
      console.warn("❌ Missing product ID:", product)
      return false
    }

    if (productType === "physical") {
      if (!variant?.color || !variant?.size) {
        console.warn("❌ Missing variant:", product)
        return false
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
      return false
    }

    setCart(prev => {
      const existing = prev.find(item => isSameCartItem(item, product))

      if (existing) {
        return prev.map(item => {
          if (!isSameCartItem(item, product)) return item

          if (productType === "digital") {
            return {
              ...item,
              quantity: 1,
              price,
              image: product.image || item.image,
              digitalProduct: product.digitalProduct || item.digitalProduct
            }
          }

          return {
            ...item,
            quantity: Number(item.quantity || 1) + 1,
            price,
            image: product.image || item.image
          }
        })
      }

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

    return true
  }

  const updateQuantity = (productId, variantOrType, delta) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.productId !== productId) return item

          const itemType = item.productType || "physical"

          const isMatch =
            itemType === "digital" || itemType === "service"
              ? itemType === variantOrType
              : (
                  item.selectedVariant?.color === variantOrType?.color &&
                  item.selectedVariant?.size === variantOrType?.size
                )

          if (!isMatch) return item

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

  const removeFromCart = (productId, variantOrType) => {
    setCart(prev =>
      prev.filter(item => {
        if (item.productId !== productId) return true

        const itemType = item.productType || "physical"

        if (itemType === "digital" || itemType === "service") {
          return itemType !== variantOrType
        }

        return !(
          item.selectedVariant?.color === variantOrType?.color &&
          item.selectedVariant?.size === variantOrType?.size
        )
      })
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const subtotal = cart.reduce((sum, item) => {
    const price = getCartItemPrice(item)
    const quantity = Number(item.quantity || 1)

    return sum + price * quantity
  }, 0)

  const tax = subtotal * 0.0825
  const shipping = 0
  const total = subtotal + tax + shipping

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