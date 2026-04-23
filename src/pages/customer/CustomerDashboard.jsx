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

  const [accountOpen, setAccountOpen] = useState(false)
  const [activeView, setActiveView] = useState("orders")

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

    socket.on("jobUpdated", (updated) => {
      setOrders(prev =>
        prev.map(o => o._id === updated._id ? updated : o)
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
        email: user?.email,
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
      <button
        onClick={() => setAccountOpen(true)}
        style={accountBtn}
      >
        ⚙️ Account
      </button>

      {/* ================= MAIN VIEW ================= */}

      {activeView === "orders" && (
        <>
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
                <p>${(order.finalPrice || order.price).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {activeView === "history" && (
        <>
          <h1>🔁 Reorder History</h1>
          <div style={grid}>
            {orders.map(order => (
              <div key={order._id} style={card}>
                <p>#{order._id.slice(-6)}</p>
                <p>${(order.finalPrice || order.price).toFixed(2)}</p>

                <button
                  onClick={() => handleReorder(order)}
                  style={reorderBtn}
                >
                  🔁 Reorder
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {activeView === "security" && (
        <div style={centerCard}>
          <h2>🔐 Change Password</h2>

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

          <button onClick={handlePasswordChange} style={button}>
            {pwLoading ? "Updating..." : "Update Password"}
          </button>

          {pwMessage && <p>{pwMessage}</p>}
        </div>
      )}

      {/* ================= DRAWER ================= */}

      {accountOpen && (
        <div style={overlay} onClick={() => setAccountOpen(false)} />
      )}

      <div style={{
        ...drawer,
        transform: accountOpen ? "translateX(0)" : "translateX(100%)"
      }}>

        <div style={menu}>

          <h2>👤 Account</h2>

          <div style={menuItem} onClick={() => {
            setActiveView("orders")
            setAccountOpen(false)
          }}>
            📦 My Orders
          </div>

          <div style={menuItem} onClick={() => {
            setActiveView("history")
            setAccountOpen(false)
          }}>
            🔁 Reorders
          </div>

          <div style={menuItem} onClick={() => {
            setActiveView("security")
            setAccountOpen(false)
          }}>
            🔐 Security
          </div>

        </div>

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
  color: "white"
}

const centerCard = {
  maxWidth: 400,
  margin: "80px auto",
  padding: 30,
  background: "#020617",
  borderRadius: 12
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
  border: "none"
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)"
}

const drawer = {
  position: "fixed",
  top: 0,
  right: 0,
  width: 260,
  height: "100vh",
  background: "#020617",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  transition: "0.3s"
}

const menu = {
  padding: 20
}

const menuItem = {
  padding: 12,
  marginTop: 10,
  background: "#0f172a",
  borderRadius: 6,
  cursor: "pointer"
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
  color: "white"
}