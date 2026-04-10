import Button from "../components/UI/Button"
import SafeImage from "../components/SafeImage"
import useCart from "../hooks/useCart"
import api from "../services/api"
import { useEffect, useState } from "react"

export default function CartDrawer({ isOpen, onClose, onCheckout }) {

  const { cart, setCart, removeFromCart } = useCart()

  const [tax, setTax] = useState(0)
  const [loadingTax, setLoadingTax] = useState(false)

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

  /* ================= TAX FIX ================= */
  useEffect(() => {
    const fetchTax = async () => {
      try {
        if (subtotal <= 0) {
          setTax(0)
          return
        }

        setLoadingTax(true)

        const res = await api.post("/tax/calculate", { subtotal })

        console.log("💰 TAX RESPONSE:", res.data)

        const parsedTax =
          typeof res.data.tax === "number"
            ? res.data.tax
            : Number(res.data.tax) || 0

        setTax(parsedTax)

      } catch (err) {
        console.error("❌ TAX ERROR:", err)
        setTax(0)
      } finally {
        setLoadingTax(false)
      }
    }

    fetchTax()
  }, [subtotal])

  const shipping = subtotal > 100 ? 0 : 10
  const total = subtotal + tax + shipping

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
          pointerEvents: isOpen ? "auto" : "none"
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
          color: "white"
        }}
      >

        <div style={{ padding: 20, display: "flex", justifyContent: "space-between" }}>
          <h2>🛒 Cart</h2>
          <button onClick={safeClose}>✖</button>
        </div>

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

        {cart.length > 0 && (
          <div style={{ padding: 20 }}>
            <p>Subtotal: ${subtotal.toFixed(2)}</p>
            <p>Tax: {loadingTax ? "..." : `$${tax.toFixed(2)}`}</p>
            <p>Shipping: {shipping === 0 ? "Free" : `$${shipping}`}</p>
            <h3>Total: ${total.toFixed(2)}</h3>

            {/* ✅ USE APP CHECKOUT */}
            <Button
              onClick={() => onCheckout && onCheckout(cart)}
              fullWidth
            >
              💳 Checkout
            </Button>

          </div>
        )}
      </div>
    </>
  )
}