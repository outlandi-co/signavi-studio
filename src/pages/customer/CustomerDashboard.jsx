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

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: ""
  })

  const [pwLoading, setPwLoading] = useState(false)
  const [pwMessage, setPwMessage] = useState("")
  const [accountOpen, setAccountOpen] = useState(false)

  const navigate = useNavigate()
  const socketRef = useRef(null)

  /* ================= USER ================= */
  useEffect(() => {
    const stored = localStorage.getItem("customerUser")

    if (!stored) {
      navigate("/customer-login")
      return
    }

    setUser(JSON.parse(stored))
  }, [navigate])

  /* ================= ORDERS ================= */
  useEffect(() => {
    const load = async () => {
      try {
        if (!user?.email) return

        const res = await api.get(`/customers/orders/${user.email}`)
        setOrders(res.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user])

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL)
    }

    const socket = socketRef.current

    const updateHandler = (updated) => {
      setOrders(prev =>
        prev.map(o => o._id === updated._id ? updated : o)
      )
    }

    const createHandler = (newOrder) => {
      setOrders(prev => [newOrder, ...prev])
    }

    socket.on("jobUpdated", updateHandler)
    socket.on("jobCreated", createHandler)

    return () => {
      socket.off("jobUpdated", updateHandler)
      socket.off("jobCreated", createHandler)
    }
  }, [])

  /* ================= PASSWORD ================= */
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

      setPwMessage("✅ Password updated")
      setPasswords({ current: "", newPass: "", confirm: "" })

    } catch (err) {
      setPwMessage(err?.response?.data?.error || "❌ Failed")
    } finally {
      setPwLoading(false)
    }
  }

  /* ================= REORDER ================= */
  const handleReorder = async (order, e) => {
    e.stopPropagation()

    try {
      await api.post("/orders", {
        items: order.items,
        customerName: user?.name || "Customer",
        email: user?.email,
        source: "store",
        status: "payment_required"
      })

      alert("✅ Reorder created!")
    } catch {
      alert("❌ Failed")
    }
  }

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>

  return (
    <div style={container}>

      {/* ACCOUNT BUTTON */}
      <button onClick={() => setAccountOpen(true)} style={accountBtn}>
        ⚙️ Account
      </button>

      {/* ORDERS */}
      <h1>📦 My Orders</h1>

      <div style={grid}>
        {orders.map(order => (
          <div
            key={order._id}
            style={card}
            onClick={() => navigate(`/order/${order._id}`)}
          >
            <p>#{order._id.slice(-6)}</p>
            <p>{order.status}</p>
            <p>${(order.finalPrice || order.price || 0).toFixed(2)}</p>

            {/* 🔥 FIX: USE REORDER */}
            <button
              onClick={(e) => handleReorder(order, e)}
              style={reorderBtn}
            >
              🔁 Reorder
            </button>
          </div>
        ))}
      </div>

      {/* OVERLAY */}
      {accountOpen && (
        <div style={overlay} onClick={() => setAccountOpen(false)} />
      )}

      {/* DRAWER */}
      <div
        style={{
          ...drawer,
          transform: accountOpen ? "translateX(0)" : "translateX(100%)"
        }}
        onClick={(e) => e.stopPropagation()} // 🔥 FIX
      >

        <div style={scrollArea}>

          <h2>👤 Account</h2>

          {user && (
            <>
              <p><b>{user.name}</b></p>
              <p style={{ opacity: 0.6 }}>{user.email}</p>
            </>
          )}

          <h3 style={{ marginTop: 20 }}>📦 Recent Orders</h3>

          {orders.slice(0, 5).map(order => (
            <div
              key={order._id}
              style={historyCard}
            >
              <span
                onClick={() => navigate(`/order/${order._id}`)}
              >
                #{order._id.slice(-6)}
              </span>

              <span>
                ${(order.finalPrice || order.price).toFixed(2)}
              </span>

              <button
                onClick={(e) => handleReorder(order, e)}
                style={miniBtn}
              >
                🔁
              </button>
            </div>
          ))}

          <h3 style={{ marginTop: 20 }}>🔐 Password</h3>

          <input
            placeholder="Current"
            type="password"
            value={passwords.current}
            onChange={(e)=>setPasswords({...passwords, current:e.target.value})}
            style={input}
          />

          <input
            placeholder="New"
            type="password"
            value={passwords.newPass}
            onChange={(e)=>setPasswords({...passwords, newPass:e.target.value})}
            style={input}
          />

          <input
            placeholder="Confirm"
            type="password"
            value={passwords.confirm}
            onChange={(e)=>setPasswords({...passwords, confirm:e.target.value})}
            style={input}
          />

          <button
            onClick={handlePasswordChange}
            disabled={pwLoading}
            style={button}
          >
            {pwLoading ? "Updating..." : "Update Password"}
          </button>

          {pwMessage && <p>{pwMessage}</p>}
        </div>

        {/* FOOTER */}
        <div style={footer}>
          <button
            onClick={()=>{
              localStorage.clear()
              navigate("/customer-login")
            }}
            style={logoutBtn}
          >
            Logout
          </button>
        </div>

      </div>

    </div>
  )
}

/* ================= STYLES ================= */

const container = { padding: 40, color: "white" }
const grid = { display: "grid", gap: 10 }

const card = {
  background: "#020617",
  padding: 15,
  borderRadius: 10,
  cursor: "pointer"
}

const reorderBtn = {
  marginTop: 10,
  background: "#3b82f6",
  border: "none",
  padding: 6,
  borderRadius: 6,
  color: "white",
  cursor: "pointer"
}

const miniBtn = {
  background: "#3b82f6",
  border: "none",
  padding: "2px 6px",
  borderRadius: 4,
  color: "white",
  cursor: "pointer"
}

const accountBtn = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 1100,
  background: "#3b82f6",
  padding: 10,
  borderRadius: 6,
  color: "white",
  border: "none",
  cursor: "pointer"
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  zIndex: 999
}

const drawer = {
  position: "fixed",
  top: 0,
  right: 0,
  width: 320,
  height: "100vh",
  background: "#020617",
  display: "flex",
  flexDirection: "column",
  zIndex: 1000,
  transition: "transform 0.3s ease"
}

const scrollArea = {
  flex: 1,
  overflowY: "auto",
  padding: 20
}

const historyCard = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 10,
  background: "#0f172a",
  marginTop: 5,
  borderRadius: 6
}

const input = {
  width: "100%",
  padding: 10,
  marginTop: 10,
  background: "#0f172a",
  border: "1px solid #334155",
  color: "white"
}

const button = {
  width: "100%",
  marginTop: 10,
  padding: 10,
  background: "#22c55e",
  border: "none"
}

const footer = {
  padding: 20,
  borderTop: "1px solid #1e293b"
}

const logoutBtn = {
  width: "100%",
  padding: 12,
  background: "#ef4444",
  border: "none",
  color: "white",
  cursor: "pointer"
}