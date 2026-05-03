import Button from "../components/UI/Button"
import SafeImage from "../components/SafeImage"
import { useCartContext } from "../context/useCartContext"
import api from "../services/api"
import { useState, useMemo } from "react"

export default function CartDrawer({ isOpen, onClose }) {

  const { cart, removeFromCart, updateQuantity } = useCartContext()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const safeClose = () => {
    if (typeof onClose === "function") onClose()
  }

  const getPrice = (item) => {
    return Number(item?.selectedVariant?.price ?? 0)
  }

  const { subtotal, tax, total } = useMemo(() => {

    const sub = cart.reduce((acc, item) => {
      const price = getPrice(item)
      const qty = Number(item?.quantity || 1)
      return acc + price * qty
    }, 0)

    const taxRate = 0.0825

    return {
      subtotal: sub,
      tax: sub * taxRate,
      total: sub + (sub * taxRate)
    }

  }, [cart])

  const handleCheckout = async () => {
    if (isRedirecting) return

    try {
      setIsRedirecting(true)

      let email = "guest@signavi.com"

      const storedUser = localStorage.getItem("customerUser")
      if (storedUser) {
        try {
          email = JSON.parse(storedUser)?.email || email
        } catch (err) {
          console.warn("⚠️ Failed to parse customerUser", err)
        }
      }

      if (!cart.length) {
        alert("Cart is empty")
        setIsRedirecting(false)
        return
      }

      const items = cart.map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: getPrice(item),
        variant: item.selectedVariant
      }))

      const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0)
      const tax = subtotal * 0.0825

      const orderRes = await api.post("/orders", {
        email,
        items,
        subtotal,
        tax,
        finalPrice: subtotal + tax
      })

      const orderId = orderRes?.data?.data?._id
      if (!orderId) throw new Error("Order ID missing")

      window.location.href = `/client-checkout/${orderId}`

    } catch (err) {
      console.error("❌ CHECKOUT ERROR:", err)
      alert(err?.message || "Checkout failed")
      setIsRedirecting(false)
    }
  }

  return (
    <>
      <div onClick={safeClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
        zIndex: 900
      }}/>

      <div style={{
        position: "fixed", right: 0, top: 0, width: 360, height: "100%",
        background: "#020617",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "0.3s",
        display: "flex",
        flexDirection: "column",
        color: "white",
        zIndex: 1000
      }}>

        <div style={{ padding: 20, display: "flex", justifyContent: "space-between" }}>
          <h2>🛒 Cart</h2>
          <button onClick={safeClose}>✖</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {cart.map((item, i) => {
            const price = getPrice(item)
            const qty = Number(item.quantity || 1)

            return (
              <div key={i} style={{ marginBottom: 12 }}>
                <SafeImage src={item.image} style={{ width: 60 }} />

                <p>{item.name}</p>

                <p style={{ color: "#22c55e", fontWeight: "bold" }}>
                  ${price.toFixed(2)} × {qty}
                </p>

                <div>
                  <button
  onClick={() =>
    updateQuantity(item.productId, item.selectedVariant, -1)
  }
>
  -
</button>

<span>{qty}</span>

<button
  onClick={() =>
    updateQuantity(item.productId, item.selectedVariant, 1)
  }
>
  +
</button>

<button
  onClick={() =>
    removeFromCart(item.productId, item.selectedVariant)
  }
>
  ✖
</button>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ padding: 20 }}>
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Tax: ${tax.toFixed(2)}</p>
          <h3>Total: ${total.toFixed(2)}</h3>

          <Button onClick={handleCheckout} disabled={isRedirecting}>
            {isRedirecting ? "Loading..." : "Checkout"}
          </Button>
        </div>

      </div>
    </>
  )
}