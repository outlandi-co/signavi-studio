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
        item._id === id
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      )
    )
  }

  const decreaseQty = (id) => {
    setCart(prev =>
      prev.map(item =>
        item._id === id
          ? { ...item, quantity: Math.max(1, (item.quantity || 1) - 1) }
          : item
      )
    )
  }

  /* ================= SUBTOTAL ================= */
  const subtotal = cart.reduce(
    (acc, item) =>
      acc + (Number(item.price) || 0) * (item.quantity || 1),
    0
  )

  /* ================= CHECKOUT (🔥 FIXED) ================= */
const handleCheckout = async () => {
  if (isRedirecting) return

  try {
    setIsRedirecting(true)

    console.log("🛒 Creating order from cart...", cart)

    /* ================= SANITIZE CART ================= */
    const safeItems = cart.map(item => ({
      name: item?.name || "Item",
      quantity: Number(item?.quantity) || 1,
      price: Number(item?.price) || 0
    }))

    if (!safeItems.length) {
      throw new Error("Cart is empty")
    }

    /* 🔥 STEP 1: CREATE ORDER */
    const orderRes = await api.post("/orders", {
      items: safeItems,
      customerName: "Guest",
      email: "",
      source: "store"
    })

    const orderId = orderRes?.data?.data?._id

    if (!orderId) {
      throw new Error("Order creation failed")
    }

    console.log("✅ Order created:", orderId)

    /* 🔥 STEP 2: SEND TO SQUARE */
    const paymentRes = await api.post(`/square/create-payment/${orderId}`)

    const url = paymentRes?.data?.url

    if (!url) {
      throw new Error("No payment URL returned")
    }

    console.log("🚀 Redirecting to Square:", url)

    window.location.assign(url)

  } catch (err) {
    console.error("❌ CHECKOUT ERROR:", err?.response?.data || err.message)

    alert("Checkout failed — check console")

    setIsRedirecting(false)
  }
}

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={safeClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          zIndex: 500
        }}
      />

      {/* DRAWER */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 360,
          height: "100%",
          background: "#020617",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "0.3s",
          display: "flex",
          flexDirection: "column",
          color: "white",
          zIndex: 1000
        }}
      >

        {/* HEADER */}
        <div style={{ padding: 20, display: "flex", justifyContent: "space-between" }}>
          <h2>🛒 Cart</h2>
          <button onClick={safeClose}>✖</button>
        </div>

        {/* ITEMS */}
        <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
          {cart.length === 0 && <p>Your cart is empty</p>}

          {cart.map(item => (
            <div key={item._id} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <SafeImage
                src={item.image || "/placeholder.png"}
                alt={item.name}
                style={{ width: 60, height: 60 }}
              />

              <div style={{ flex: 1 }}>
                <strong>{item.name}</strong>
                <p>${Number(item.price).toFixed(2)}</p>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => decreaseQty(item._id)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQty(item._id)}>+</button>
                </div>
              </div>

              <button onClick={() => removeFromCart(item._id)}>✖</button>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        {cart.length > 0 && (
          <div style={{ padding: 20 }}>
            <p>Subtotal: ${subtotal.toFixed(2)}</p>

            <p>Tax: Calculated at checkout</p>
            <p>Shipping: Calculated at checkout</p>

            <h3>Estimated Total: ${subtotal.toFixed(2)}</h3>

            <Button
              onClick={handleCheckout}
              fullWidth
              style={{ marginTop: 10 }}
            >
              {isRedirecting
                ? "Connecting to secure payment..."
                : "💳 Checkout"}
            </Button>

          </div>
        )}
      </div>
    </>
  )
}