import Button from "../components/UI/Button"
import SafeImage from "../components/SafeImage"
import useCart from "../hooks/useCart"
import api from "../services/api"
import { useState } from "react"

export default function CartDrawer({ isOpen, onClose }) {

  const { cart, setCart, removeFromCart } = useCart()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const safeClose = () => {
    if (typeof onClose === "function") onClose()
  }

  /* ================= QTY ================= */
  const increaseQty = (id) => {
    setCart(prev =>
      prev.map(item =>
        item.productId === id
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      )
    )
  }

  const decreaseQty = (id) => {
    setCart(prev =>
      prev.map(item =>
        item.productId === id
          ? { ...item, quantity: Math.max(1, (item.quantity || 1) - 1) }
          : item
      )
    )
  }

  /* ================= SUBTOTAL ================= */
  const subtotal = cart.reduce((acc, item) => {
    const price = Number(item?.variant?.price ?? item?.price ?? 0)
    const qty = Number(item?.quantity) || 1
    return acc + price * qty
  }, 0)

  /* ================= TAX ================= */
  const TAX_RATE = 0.0825
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  /* ================= CHECKOUT ================= */
  const handleCheckout = async () => {
    if (isRedirecting) return

    try {
      setIsRedirecting(true)

      console.log("🛒 START CHECKOUT")

      const safeItems = cart.map(item => ({
        name: item?.name || "Item",
        quantity: Number(item?.quantity) || 1,
        price: Number(item?.variant?.price ?? item?.price ?? 0)
      }))

      if (!safeItems.length) {
        throw new Error("Cart is empty")
      }

      const totalQuantity = safeItems.reduce((a, i) => a + i.quantity, 0)

      const storedUser = JSON.parse(localStorage.getItem("customerUser") || "null")

      /* 🔥 FALLBACK EMAIL (IMPORTANT FIX) */
      const email =
        storedUser?.email ||
        prompt("Enter your email for receipt & tracking:")

      if (!email) {
        throw new Error("Email is required for checkout")
      }

      /* ================= CREATE ORDER ================= */
      const orderRes = await api.post("/orders", {
        customerName: storedUser?.name || "Guest",
        email,
        items: safeItems,
        quantity: totalQuantity,
        subtotal,
        tax,
        price: total,
        source: "store"
      })

      const orderId = orderRes?.data?._id

      if (!orderId) {
        throw new Error("Order creation failed")
      }

      console.log("✅ ORDER CREATED:", orderId)

      /* ================= CREATE PAYMENT ================= */
      const paymentRes = await api.post(`/square/create-payment/${orderId}`)
      const url = paymentRes?.data?.url

      if (!url) {
        throw new Error("No payment URL returned")
      }

      console.log("💳 REDIRECTING TO PAYMENT:", url)

      window.location.assign(url)

    } catch (err) {
      console.error("❌ CHECKOUT ERROR:", err?.response?.data || err.message)

      alert(
        err?.response?.data?.message ||
        err.message ||
        "Checkout failed. Please try again."
      )

      setIsRedirecting(false)
    }
  }

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={safeClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          zIndex: 900
        }}
      />

      {/* DRAWER */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 360,
          height: "100vh",
          background: "#020617",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "0.3s ease",
          display: "flex",
          flexDirection: "column",
          color: "white",
          zIndex: 1000
        }}
      >

        {/* HEADER */}
        <div style={{
          padding: 20,
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "1px solid #1e293b"
        }}>
          <h2>🛒 Cart</h2>
          <button onClick={safeClose}>✖</button>
        </div>

        {/* ITEMS */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: 20
        }}>
          {cart.length === 0 && <p>Your cart is empty</p>}

          {cart.map((item, index) => {
            const price = Number(item?.variant?.price ?? item?.price ?? 0)

            const safeKey =
              item.productId ||
              item._id ||
              `${item.name || "item"}-${index}`

            const id = item.productId || item._id

            return (
              <div
                key={safeKey}
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 16,
                  borderBottom: "1px solid #1e293b",
                  paddingBottom: 10
                }}
              >
                <SafeImage
                  src={item.image || "/placeholder.png"}
                  alt={item.name}
                  style={{ width: 60, height: 60 }}
                />

                <div style={{ flex: 1 }}>
                  <strong>{item.name}</strong>

                  <p style={{ fontSize: 12, opacity: 0.7 }}>
                    {item.variant?.color || "N/A"} / {item.variant?.size || "N/A"}
                  </p>

                  <p>${price.toFixed(2)}</p>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => decreaseQty(id)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQty(id)}>+</button>
                  </div>
                </div>

                <button onClick={() => removeFromCart(id)}>✖</button>
              </div>
            )
          })}
        </div>

        {/* FOOTER */}
        {cart.length > 0 && (
          <div style={{
            padding: 20,
            borderTop: "1px solid #1e293b"
          }}>
            <p>Subtotal: ${subtotal.toFixed(2)}</p>
            <p>Tax (8.25%): ${tax.toFixed(2)}</p>
            <h3>Total: ${total.toFixed(2)}</h3>

            <Button
              onClick={handleCheckout}
              fullWidth
              style={{ marginTop: 10 }}
              disabled={isRedirecting}
            >
              {isRedirecting
                ? "🔐 Connecting to payment..."
                : "💳 Checkout"}
            </Button>
          </div>
        )}
      </div>
    </>
  )
}