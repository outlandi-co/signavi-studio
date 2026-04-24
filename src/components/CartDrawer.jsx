import Button from "../components/UI/Button"
import SafeImage from "../components/SafeImage"
import useCart from "../hooks/useCart"
import api from "../services/api"
import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"

export default function CartDrawer({ isOpen, onClose }) {

  const navigate = useNavigate()
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart()

  const [isRedirecting, setIsRedirecting] = useState(false)

  /* 🔥 PASSWORD MODAL STATE */
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loadingPassword, setLoadingPassword] = useState(false)

  const safeClose = () => {
    if (typeof onClose === "function") onClose()
  }

  /* ================= TOTALS ================= */
  const { subtotal, tax, total } = useMemo(() => {

    const sub = cart.reduce((acc, item) => {
      const price = Number(
        item?.selectedVariant?.price ??
        item?.variant?.price ??
        0
      )
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

  /* ================= PASSWORD UPDATE ================= */
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert("Fill out both fields")
      return
    }

    try {
      setLoadingPassword(true)

      const token = localStorage.getItem("customerToken")

      await api.post(
        "/auth/change-password",
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      alert("✅ Password updated")

      setCurrentPassword("")
      setNewPassword("")
      setShowPasswordModal(false)

    } catch (err) {
      console.error(err)
      alert("❌ Failed to update password")
    } finally {
      setLoadingPassword(false)
    }
  }

  /* ================= CHECKOUT ================= */
  const handleCheckout = async () => {
    if (isRedirecting) return

    try {
      setIsRedirecting(true)

      const storedUser = JSON.parse(localStorage.getItem("customerUser") || "null")

      if (!storedUser?.email) {
        alert("Please log in")
        window.location.href = "/customer-login"
        return
      }

      const orderRes = await api.post("/orders", {
        customerName: storedUser?.name || "Guest",
        email: storedUser.email,
        items: cart
      })

      const orderId = orderRes?.data?._id

      const paymentRes = await api.post(`/square/create-payment/${orderId}`)
      const url = paymentRes?.data?.url

      if (!url) {
        throw new Error("No payment URL")
      }

      /* 🔥 CLEAR CART ONLY AFTER SUCCESS */
      clearCart()
      localStorage.removeItem("cart")

      window.location.href = url

    } catch (err) {
      console.error("❌ CHECKOUT ERROR:", err)
      alert("Checkout failed")
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
      <div style={{
        position: "fixed",
        right: 0,
        top: 0,
        width: 360,
        height: "100%",
        background: "#020617",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "0.3s ease",
        display: "flex",
        flexDirection: "column",
        color: "white",
        zIndex: 1000
      }}>

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

        {/* ACCOUNT ACTIONS */}
        <div style={{
          padding: "10px 20px",
          borderBottom: "1px solid #1e293b",
          display: "flex",
          flexDirection: "column",
          gap: 8
        }}>
          <button
            onClick={() => {
              safeClose()
              navigate("/my-orders")
            }}
            style={navBtn}
          >
            📦 Orders
          </button>

          <button
            onClick={() => setShowPasswordModal(true)}
            style={navBtn}
          >
            🔐 Change Password
          </button>
        </div>

        {/* CART ITEMS */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: 20
        }}>
          {cart.length === 0 && <p>Cart is empty</p>}

          {cart.map((item, index) => {

            const price = Number(
              item?.selectedVariant?.price ??
              item?.variant?.price ??
              0
            )

            const qty = Number(item?.quantity || 1)
            const lineTotal = price * qty
            const id = item.productId || item._id

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
                    {(item.selectedVariant || item.variant)?.color || "N/A"} /
                    {(item.selectedVariant || item.variant)?.size || "N/A"}
                  </p>

                  <p>${price.toFixed(2)} × {qty}</p>

                  <p style={{ color: "#22c55e", fontWeight: "bold" }}>
                    ${lineTotal.toFixed(2)}
                  </p>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => updateQuantity(id, qty - 1)}>-</button>
                    <span>{qty}</span>
                    <button onClick={() => updateQuantity(id, qty + 1)}>+</button>
                  </div>
                </div>

                <button onClick={() => removeFromCart(id)}>✖</button>
              </div>
            )
          })}
        </div>

        {/* TOTALS + CHECKOUT */}
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

        {/* PASSWORD MODAL */}
        {showPasswordModal && (
          <div style={modalOverlay}>
            <div style={modal}>
              <h3>Change Password</h3>

              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e)=>setCurrentPassword(e.target.value)}
                style={input}
              />

              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e)=>setNewPassword(e.target.value)}
                style={input}
              />

              <div style={{ display: "flex", gap: 10 }}>
                <Button onClick={handleChangePassword} loading={loadingPassword}>
                  Update
                </Button>

                <Button variant="dark" onClick={()=>setShowPasswordModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  )
}

/* STYLES */
const navBtn = {
  width: "100%",
  textAlign: "left",
  padding: "10px",
  background: "#0f172a",
  borderRadius: "8px",
  cursor: "pointer",
  color: "white",
  border: "1px solid #1e293b"
}

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
}

const modal = {
  background: "#020617",
  padding: 20,
  borderRadius: 10,
  width: 300
}

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  background: "#0f172a",
  color: "white",
  border: "1px solid #1e293b"
}