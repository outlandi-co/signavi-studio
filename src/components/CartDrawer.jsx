import Button from "../components/UI/Button"
import SafeImage from "../components/SafeImage"
import useCart from "../hooks/useCart"
import api from "../services/api"
import { useState, useMemo } from "react"

export default function CartDrawer({ isOpen, onClose }) {

  const { cart, removeFromCart, updateQuantity } = useCart()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const safeClose = () => {
    if (typeof onClose === "function") onClose()
  }

  /* ================= SAFE CALCULATIONS ================= */
  const { subtotal, tax, total } = useMemo(() => {

    const sub = cart.reduce((acc, item) => {
      const price = Number(item?.selectedVariant?.price || 0)
      const qty = Number(item?.quantity || 1)

      return acc + (price * qty)
    }, 0)

    const taxRate = 0.0825
    const taxVal = sub * taxRate

    return {
      subtotal: sub,
      tax: taxVal,
      total: sub + taxVal
    }

  }, [cart]) // 🔥 ensures recalculation on every cart update

  /* ================= CHECKOUT ================= */
  const handleCheckout = async () => {
    if (isRedirecting) return

    try {
      setIsRedirecting(true)

      const safeItems = cart.map(item => ({
        _id: item.productId,
        selectedVariant: item.selectedVariant,
        quantity: Number(item.quantity) || 1
      }))

      const orderRes = await api.post("/orders", {
        customerName: "Guest",
        email: "",
        items: safeItems
      })

      const orderId = orderRes?.data?._id

      const paymentRes = await api.post(`/square/create-payment/${orderId}`)
      const url = paymentRes?.data?.url

      window.location.href = url

    } catch (err) {
      console.error(err)
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

            const price = Number(item?.selectedVariant?.price || 0)
            const qty = Number(item?.quantity || 1)
            const lineTotal = price * qty

            return (
              <div key={index} style={{
                display: "flex",
                gap: 10,
                marginBottom: 16,
                borderBottom: "1px solid #1e293b",
                paddingBottom: 10
              }}>
                <SafeImage
                  src={item.image || "/placeholder.png"}
                  alt={item.name}
                  style={{ width: 60, height: 60 }}
                />

                <div style={{ flex: 1 }}>
                  <strong>{item.name}</strong>

                  <p style={{ fontSize: 12, opacity: 0.7 }}>
                    {item.selectedVariant?.color} / {item.selectedVariant?.size}
                  </p>

                  <p>${price.toFixed(2)} × {qty}</p>

                  <p style={{
                    color: "#22c55e",
                    fontWeight: "bold"
                  }}>
                    ${lineTotal.toFixed(2)}
                  </p>

                  {/* QTY CONTROLS */}
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => updateQuantity(index, qty - 1)}>-</button>
                    <span>{qty}</span>
                    <button onClick={() => updateQuantity(index, qty + 1)}>+</button>
                  </div>
                </div>

                <button onClick={() => removeFromCart(index)}>✖</button>
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
            <p>Tax: ${tax.toFixed(2)}</p>

            <h3 style={{ color: "#22c55e" }}>
              Total: ${total.toFixed(2)}
            </h3>

            <Button
              onClick={handleCheckout}
              fullWidth
              disabled={isRedirecting}
            >
              {isRedirecting
                ? "🔐 Connecting..."
                : "💳 Checkout"}
            </Button>
          </div>
        )}
      </div>
    </>
  )
}