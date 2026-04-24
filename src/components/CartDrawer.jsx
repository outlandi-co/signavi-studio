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
      window.location.href = paymentRes.data.url

    } catch (err) {
      console.error(err)
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
          pointerEvents: isOpen ? "auto" : "none"
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
        transition: "0.3s",
        padding: 20,
        color: "white"
      }}>

        <h2>🛒 Cart</h2>

        {/* 🔥 ACCOUNT ACTIONS */}
        <div style={{ marginBottom: 20 }}>
          <button onClick={() => {
            safeClose()
            navigate("/my-orders")
          }} style={btn}>
            📦 Orders
          </button>

          <button onClick={() => {
            setShowPasswordModal(true)
          }} style={btn}>
            🔐 Change Password
          </button>
        </div>

        {/* CART */}
        {cart.length === 0 && <p>Cart is empty</p>}

        {cart.map((item, i) => (
          <div key={i}>
            <p>{item.name}</p>
          </div>
        ))}

        {/* CHECKOUT */}
        {cart.length > 0 && (
          <Button onClick={handleCheckout} fullWidth>
            Checkout
          </Button>
        )}

        {/* 🔥 PASSWORD MODAL */}
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

                <Button
                  variant="dark"
                  onClick={()=>setShowPasswordModal(false)}
                >
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
const btn = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  background: "#0f172a",
  borderRadius: 6
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