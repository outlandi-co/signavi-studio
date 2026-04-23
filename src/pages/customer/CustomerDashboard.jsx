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

  const [activeView, setActiveView] = useState("orders")
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: ""
  })

  const [pwLoading, setPwLoading] = useState(false)
  const [pwMessage, setPwMessage] = useState("")

  const navigate = useNavigate()
  const socketRef = useRef(null)
  const dropdownRef = useRef(null)

  /* ================= USER ================= */
  useEffect(() => {
    const stored = localStorage.getItem("customerUser")

    if (!stored) {
      navigate("/customer-login")
      return
    }

    setUser(JSON.parse(stored))
  }, [navigate])

  /* ================= CLOSE DROPDOWN ================= */
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

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

  const handleLogout = () => {
    localStorage.clear()
    navigate("/customer-login")
  }

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>

  return (
    <div style={container}>

      {/* ================= NAVBAR ================= */}
      <div style={nav}>
        <div style={brand}>SignaVi</div>

        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            style={avatar}
          >
            {user?.name?.[0]?.toUpperCase() || "U"}
          </button>

          {dropdownOpen && (
            <div style={dropdown}>
              <div style={dropdownItem} onClick={() => setActiveView("orders")}>
                📦 My Orders
              </div>
              <div style={dropdownItem} onClick={() => setActiveView("history")}>
                🔁 Reorders
              </div>
              <div style={dropdownItem} onClick={() => setActiveView("security")}>
                🔐 Security
              </div>
              <div style={divider} />
              <div style={dropdownItem} onClick={handleLogout}>
                🚪 Logout
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= CONTENT ================= */}

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

    </div>
  )
}

/* ================= STYLES ================= */

const container = { padding: 20, color: "white" }

const nav = {
  display: "flex",
  justifyContent: "space-between",
  padding: 15,
  borderBottom: "1px solid #1e293b"
}

const brand = { fontWeight: "bold" }

const avatar = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: "#3b82f6",
  border: "none",
  color: "white",
  cursor: "pointer"
}

const dropdown = {
  position: "absolute",
  right: 0,
  top: 40,
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 8,
  overflow: "hidden"
}

const dropdownItem = {
  padding: 10,
  cursor: "pointer"
}

const divider = {
  height: 1,
  background: "#1e293b"
}

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