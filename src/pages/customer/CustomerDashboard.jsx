import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import { io } from "socket.io-client"

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const SOCKET_URL = API_URL.replace("/api", "")

export default function CustomerDashboard() {

  const [orders, setOrders] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  /* 🔐 PASSWORD STATE */
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: ""
  })

  const [pwLoading, setPwLoading] = useState(false)
  const [pwMessage, setPwMessage] = useState("")

  const navigate = useNavigate()
  const socketRef = useRef(null)

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const stored = localStorage.getItem("customerUser")

    if (!stored) {
      console.warn("🚫 No user → redirect")
      navigate("/customer-login")
      return
    }

    setUser(JSON.parse(stored))
  }, [navigate])

  /* ================= LOAD ORDERS ================= */
  useEffect(() => {
    const load = async () => {
      try {
        if (!user?.email) return

        const res = await api.get(`/customers/orders/${user.email}`)
        setOrders(res.data || [])

      } catch (err) {
        console.error("❌ LOAD ORDERS ERROR:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user])

  /* ================= SOCKET ================= */
  useEffect(() => {

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"]
      })
    }

    const socket = socketRef.current

    const handleUpdate = (updatedOrder) => {
      setOrders(prev =>
        prev.map(o =>
          o._id === updatedOrder._id ? updatedOrder : o
        )
      )
    }

    const handleCreate = (newOrder) => {
      setOrders(prev => [newOrder, ...prev])
    }

    socket.on("jobUpdated", handleUpdate)
    socket.on("jobCreated", handleCreate)

    return () => {
      socket.off("jobUpdated", handleUpdate)
      socket.off("jobCreated", handleCreate)
    }

  }, [])

  /* ================= PAYMENT ================= */
  const handlePayment = async (e, orderId) => {
    e.stopPropagation()

    try {
      const res = await api.post(`/square/create-payment/${orderId}`)

      if (!res?.data?.url) throw new Error("No payment URL")

      window.location.href = res.data.url

    } catch (err) {
      console.error("❌ PAYMENT ERROR:", err)
      alert("Payment failed")
    }
  }

  /* ================= REORDER ================= */
  const handleReorder = async (order) => {
    try {
      await api.post("/orders", {
        ...order,
        status: "payment_required"
      })

      alert("Reorder created!")

    } catch (err) {
      console.error(err)
      alert("Reorder failed")
    }
  }

  /* ================= PASSWORD CHANGE ================= */
  const handlePasswordChange = async () => {
    try {
      setPwMessage("")

      if (!passwords.current || !passwords.newPass) {
        setPwMessage("❌ Fill all fields")
        return
      }

      if (passwords.newPass !== passwords.confirm) {
        setPwMessage("❌ Passwords do not match")
        return
      }

      setPwLoading(true)

      await api.post("/auth/change-password", {
        currentPassword: passwords.current,
        newPassword: passwords.newPass
      })

      setPwMessage("✅ Password updated!")

      setPasswords({
        current: "",
        newPass: "",
        confirm: ""
      })

    } catch (err) {
      console.error(err)
      setPwMessage(
        err?.response?.data?.error || "❌ Failed to update password"
      )
    } finally {
      setPwLoading(false)
    }
  }

  /* ================= STATUS ================= */
  const steps = ["payment_required","paid","production","shipping","delivered"]

  const getIndex = (status) => {
    const i = steps.indexOf(status)
    return i === -1 ? 0 : i
  }

  /* ================= UI ================= */

  if (loading) {
    return <p style={{ padding: 40 }}>Loading your orders...</p>
  }

  return (
    <div style={container}>

      {/* LEFT SIDE */}
      <div style={left}>

        <h1 style={title}>📦 My Orders</h1>

        {orders.length === 0 && (
          <p style={{ opacity: 0.6 }}>No orders yet</p>
        )}

        <div style={grid}>
          {orders.map(order => {
            const current = getIndex(order.status)

            return (
              <div
                key={order._id}
                onClick={() => navigate(`/order/${order._id}`)}
                style={card}
              >
                <div style={cardHeader}>
                  <span style={orderId}>
                    #{order._id.slice(-6)}
                  </span>
                  <span>{order.status}</span>
                </div>

                <div style={price}>
                  ${(order.finalPrice || order.price || 0).toFixed(2)}
                </div>

                <div style={timeline}>
                  {steps.map((step, i) => (
                    <div
                      key={step}
                      style={{
                        flex: 1,
                        height: 6,
                        borderRadius: 4,
                        background: i <= current ? "#22c55e" : "#1e293b"
                      }}
                    />
                  ))}
                </div>

                <div style={footer}>
                  <span>Qty: {order.quantity}</span>

                  {order.status === "payment_required" && (
                    <button
                      onClick={(e) => handlePayment(e, order._id)}
                      style={payBtn}
                    >
                      💳 Pay
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReorder(order)
                    }}
                    style={reorderBtn}
                  >
                    🔁 Reorder
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div style={right}>

        <h2>👤 Account</h2>

        {user && (
          <>
            <p><b>Name:</b> {user.name}</p>
            <p><b>Email:</b> {user.email}</p>
          </>
        )}

        {/* PASSWORD */}
        <div style={{ marginTop: 20 }}>
          <h3>🔐 Change Password</h3>

          <input
            type="password"
            placeholder="Current password"
            value={passwords.current}
            onChange={(e) =>
              setPasswords({ ...passwords, current: e.target.value })
            }
            style={input}
          />

          <input
            type="password"
            placeholder="New password"
            value={passwords.newPass}
            onChange={(e) =>
              setPasswords({ ...passwords, newPass: e.target.value })
            }
            style={input}
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={passwords.confirm}
            onChange={(e) =>
              setPasswords({ ...passwords, confirm: e.target.value })
            }
            style={input}
          />

          <button
            onClick={handlePasswordChange}
            disabled={pwLoading}
            style={{
              ...button,
              opacity: pwLoading ? 0.6 : 1
            }}
          >
            {pwLoading ? "Updating..." : "Update Password"}
          </button>

          {pwMessage && (
            <p style={{ marginTop: 10 }}>{pwMessage}</p>
          )}
        </div>

        {/* LOGOUT */}
        <button
          onClick={() => {
            localStorage.clear()
            navigate("/customer-login")
          }}
          style={logoutBtn}
        >
          Logout
        </button>

      </div>

    </div>
  )
}

/* ================= STYLES ================= */

const container = {
  display: "flex",
  gap: 30,
  padding: 40,
  color: "white"
}

const left = { flex: 2 }

const right = {
  flex: 1,
  background: "#0f172a",
  padding: 20,
  borderRadius: 12
}

const title = { marginBottom: 20 }

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 20
}

const card = {
  background: "#020617",
  padding: 20,
  borderRadius: 12,
  border: "1px solid #1e293b",
  cursor: "pointer"
}

const cardHeader = {
  display: "flex",
  justifyContent: "space-between"
}

const orderId = { fontSize: 12, opacity: 0.6 }

const price = { fontSize: 22, fontWeight: "bold" }

const timeline = { display: "flex", gap: 4 }

const footer = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 10
}

const payBtn = {
  background: "#22c55e",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
  cursor: "pointer"
}

const reorderBtn = {
  background: "#3b82f6",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
  cursor: "pointer",
  color: "white"
}

const logoutBtn = {
  marginTop: 20,
  padding: 10,
  width: "100%",
  background: "#ef4444",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
}

const input = {
  width: "100%",
  padding: 10,
  marginTop: 10,
  borderRadius: 6,
  border: "1px solid #334155",
  background: "#020617",
  color: "white"
}

const button = {
  marginTop: 10,
  padding: 10,
  width: "100%",
  background: "#22c55e",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
}