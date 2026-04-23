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

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("orders")

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: ""
  })

  const [pwLoading, setPwLoading] = useState(false)
  const [pwMessage, setPwMessage] = useState("")

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
        const res = await api.get("/orders/my-orders")
        const safeOrders = Array.isArray(res.data) ? res.data : []
        setOrders(safeOrders)
      } catch (err) {
        console.error(err)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    if (user) load()
  }, [user])

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL)
    }
    const socket = socketRef.current

    socket.on("jobUpdated", (updated) => {
      setOrders(prev =>
        prev.map(o => (o._id === updated._id ? updated : o))
      )
    })

    socket.on("jobCreated", (newOrder) => {
      setOrders(prev => [newOrder, ...prev])
    })

    return () => {
      socket.off("jobUpdated")
      socket.off("jobCreated")
    }
  }, [])

  /* ================= ESC TO CLOSE ================= */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setDrawerOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
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
  const handleReorder = async (order) => {
    try {
      await api.post("/orders", {
        items: order.items,
        customerName: user?.name,
        email: user?.email
      })
      alert("✅ Reorder created!")
    } catch {
      alert("❌ Failed")
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate("/customer-login")
  }

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>

  return (
    <div style={{ padding: 20, color: "white" }}>

      {/* NAVBAR */}
      <div style={{
  display: "flex",
  alignItems: "center",
  marginBottom: 20
}}>
  <h2>SignaVi</h2>

  {/* 🔥 PUSH RIGHT */}
  <div style={{ marginLeft: "auto" }}>
    <button
      onClick={() => setDrawerOpen(true)}
      style={{
        padding: "8px 18px",
        borderRadius: 8,
        background: "#020617",
        border: "1px solid #1e293b",
        color: "white",
        cursor: "pointer",
        fontWeight: 600,
        letterSpacing: 0.5,
        transition: "all 0.2s ease"
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = "#1e293b"}
      onMouseLeave={(e) => e.currentTarget.style.background = "#020617"}
    >
      Account
    </button>
  </div>
</div>

      {/* MAIN CONTENT */}
      <h3>My Orders</h3>

      {orders.length === 0 && <p>No orders yet</p>}

      {orders.map(order => (
        <div
          key={order._id}
          style={{
            padding: 12,
            borderBottom: "1px solid #1e293b",
            transition: "background 0.2s ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#0f172a"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          {order.status}
        </div>
      ))}

      {/* ================= DRAWER ================= */}

      {/* OVERLAY (always mounted for smooth fade) */}
      <div
        onClick={() => setDrawerOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
          zIndex: 1000
        }}
      />

      {/* PANEL (always mounted, animated with transform) */}
      <div style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100%",
        width: 360,
        background: "#020617",
        borderLeft: "1px solid #1e293b",
        padding: 20,
        zIndex: 1001,
        overflowY: "auto",
        transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)"
      }}>

        {/* CLOSE */}
        <button
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "transparent",
            color: "white",
            border: "none",
            fontSize: 18,
            cursor: "pointer"
          }}
        >
          ✕
        </button>

        <h2 style={{ marginBottom: 6 }}>Account</h2>
        <p>{user?.name}</p>
        <p style={{ opacity: 0.6 }}>{user?.email}</p>

        {/* TABS */}
        <div style={{
          display: "flex",
          gap: 8,
          marginTop: 20
        }}>
          {["orders", "history", "security"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                background:
                  activeTab === tab ? "#1e293b" : "transparent",
                border: "1px solid #1e293b",
                color: "white",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {tab === "orders" && "Orders"}
              {tab === "history" && "Reorders"}
              {tab === "security" && "Security"}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div style={{ marginTop: 20 }}>

          {activeTab === "orders" && (
            orders.map(o => (
              <div key={o._id}>{o.status}</div>
            ))
          )}

          {activeTab === "history" && (
            orders.map(o => (
              <div key={o._id}>
                {o.status}
                <button onClick={() => handleReorder(o)}>
                  Reorder
                </button>
              </div>
            ))
          )}

          {activeTab === "security" && (
            <div>
              <input
                placeholder="Current"
                value={passwords.current}
                onChange={(e)=>setPasswords({...passwords, current:e.target.value})}
              />
              <input
                placeholder="New"
                value={passwords.newPass}
                onChange={(e)=>setPasswords({...passwords, newPass:e.target.value})}
              />
              <input
                placeholder="Confirm"
                value={passwords.confirm}
                onChange={(e)=>setPasswords({...passwords, confirm:e.target.value})}
              />

              <button onClick={handlePasswordChange}>
                {pwLoading ? "Updating..." : "Update Password"}
              </button>

              {pwMessage && <p>{pwMessage}</p>}
            </div>
          )}
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: 30,
            background: "#ef4444",
            color: "white",
            padding: 10,
            width: "100%"
          }}
        >
          Logout
        </button>
      </div>

    </div>
  )
}