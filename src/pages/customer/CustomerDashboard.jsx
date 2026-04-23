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

  /* ================= LOAD ORDERS ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/orders/my-orders")

        // 🔥 FINAL FIX: ALWAYS ARRAY
        const safeOrders = Array.isArray(res.data) ? res.data : []

        console.log("🧪 DASHBOARD ORDERS:", safeOrders)

        setOrders(safeOrders)

      } catch (err) {
        console.error("❌ LOAD ORDERS ERROR:", err)
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
        prev.map(o =>
          o._id === updated._id ? updated : o
        )
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
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <h2>SignaVi</h2>

        <div ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(v => !v)}>
            {user?.name?.[0] || "U"}
          </button>

          {dropdownOpen && (
            <div style={{ background: "#111", padding: 10 }}>
              <div onClick={() => setActiveView("orders")}>Orders</div>
              <div onClick={() => setActiveView("history")}>Reorders</div>
              <div onClick={() => setActiveView("security")}>Security</div>
              <div onClick={handleLogout}>Logout</div>
            </div>
          )}
        </div>
      </div>

      {/* ================= CONTENT ================= */}

      {/* ORDERS */}
      {activeView === "orders" && (
        <>
          {orders.length === 0 && <p>No orders yet</p>}

          {orders.map(order => (
            <div key={order._id}>{order.status}</div>
          ))}
        </>
      )}

      {/* REORDERS */}
      {activeView === "history" && (
        <>
          {orders.length === 0 && <p>No previous orders</p>}

          {orders.map(order => (
            <div key={order._id}>
              {order.status}
              <button onClick={() => handleReorder(order)}>
                Reorder
              </button>
            </div>
          ))}
        </>
      )}

      {/* SECURITY */}
      {activeView === "security" && (
        <div>
          <input
            placeholder="Current Password"
            value={passwords.current}
            onChange={(e)=>setPasswords({...passwords, current:e.target.value})}
          />
          <input
            placeholder="New Password"
            value={passwords.newPass}
            onChange={(e)=>setPasswords({...passwords, newPass:e.target.value})}
          />
          <input
            placeholder="Confirm Password"
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
  )
}