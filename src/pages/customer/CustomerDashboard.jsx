import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import { io } from "socket.io-client"

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const SOCKET_URL = API_URL.replace("/api", "")

/* ================= STATUS ================= */
const STATUS_META = {
  pending: { label: "Pending" },
  payment_required: { label: "Payment Required" },
  paid: { label: "Paid" },
  production: { label: "Production" },
  shipping: { label: "Shipping" },
  shipped: { label: "Shipped" },
  delivered: { label: "Delivered" }
}

/* ================= HELPERS ================= */
const formatMoney = (n = 0) => `$${Number(n).toFixed(2)}`
const formatDate = (d) => d ? new Date(d).toLocaleDateString() : "—"

/* 🔐 PASSWORD STRENGTH */
const getPasswordStrength = (password) => {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const levels = ["Weak", "Fair", "Good", "Strong"]
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"]

  return {
    label: levels[score - 1] || "Weak",
    color: colors[score - 1] || "#ef4444",
    score
  }
}

const Rule = ({ valid, text }) => (
  <div style={{ fontSize: 12, color: valid ? "#22c55e" : "#64748b" }}>
    {valid ? "✔" : "•"} {text}
  </div>
)

/* ================= CARD ================= */
const OrderCard = ({ order }) => (
  <div style={card}>
    <div style={cardHeader}>
      <b>#{order._id.slice(-6)}</b>
      <span>{order.status}</span>
    </div>
    <div style={rowWrap}>
      <span>{formatMoney(order.finalPrice || order.price)}</span>
      <span>{formatDate(order.createdAt)}</span>
    </div>
  </div>
)

export default function CustomerDashboard() {

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("orders")

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: ""
  })

  const [pwLoading, setPwLoading] = useState(false)
  const [pwMessage, setPwMessage] = useState("")

  const socketRef = useRef(null)
  const navigate = useNavigate()

  const storedUser = JSON.parse(localStorage.getItem("customerUser") || "null")

  useEffect(() => {
    if (!storedUser) navigate("/customer-login")
  }, [storedUser, navigate])

  useEffect(() => {
    api.get("/orders/my-orders").then(res => {
      const safe = Array.isArray(res.data)
        ? res.data
        : res.data?.data || []
      setOrders(safe)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!socketRef.current) socketRef.current = io(SOCKET_URL)
    const socket = socketRef.current

    socket.on("jobUpdated", (updated) => {
      setOrders(prev => prev.map(o => o._id === updated._id ? updated : o))
    })

    socket.on("jobCreated", (newOrder) => {
      setOrders(prev => [newOrder, ...prev])
    })

    return () => {
      socket.off("jobUpdated")
      socket.off("jobCreated")
    }
  }, [])

  /* FILTER + SORT */
  const processedOrders = orders
    .filter(o => {
      const s = search.toLowerCase()
      return (
        o._id.toLowerCase().includes(s) ||
        o.status.toLowerCase().includes(s)
      ) &&
      (statusFilter === "all" || o.status === statusFilter)
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === "price-high") return (b.price || 0) - (a.price || 0)
      if (sortBy === "price-low") return (a.price || 0) - (b.price || 0)
      return 0
    })

  const strength = getPasswordStrength(passwords.newPass)

  const isValidPassword =
    strength.score >= 3 &&
    passwords.newPass === passwords.confirm

  const handlePasswordChange = async () => {
    try {
      setPwMessage("")
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

  return (
    <div style={container}>

      <div style={header}>
        <h2>Dashboard</h2>
        <button style={accountBtn} onClick={()=>setDrawerOpen(true)}>
          Account
        </button>
      </div>

      {/* CONTROLS */}
      <div style={controls}>
        <input placeholder="Search..." value={search} onChange={(e)=>setSearch(e.target.value)} style={input} />

        <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} style={input}>
          <option value="all">All</option>
          {Object.keys(STATUS_META).map(s => (
            <option key={s} value={s}>{STATUS_META[s].label}</option>
          ))}
        </select>

        <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} style={input}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price-high">Price High</option>
          <option value="price-low">Price Low</option>
        </select>
      </div>

      {/* ORDERS TAB */}
      {activeTab === "orders" && (
        <>
          {loading && <p>Loading...</p>}
          {!loading && processedOrders.length === 0 && <p>No orders yet</p>}
          {!loading && processedOrders.map(o => (
            <OrderCard key={o._id} order={o} />
          ))}
        </>
      )}

      {/* PROFILE TAB */}
      {activeTab === "profile" && (
        <div style={securityBox}>
          <h2>Profile</h2>
          <p><strong>Name:</strong> {storedUser?.name}</p>
          <p><strong>Email:</strong> {storedUser?.email}</p>
        </div>
      )}

      {/* SECURITY TAB */}
      {activeTab === "security" && (
        <div style={securityBox}>
          <h2>Security</h2>

          <input type="password" placeholder="Current Password"
            value={passwords.current}
            onChange={(e)=>setPasswords({...passwords,current:e.target.value})}
            style={input}
          />

          <input type="password" placeholder="New Password"
            value={passwords.newPass}
            onChange={(e)=>setPasswords({...passwords,newPass:e.target.value})}
            style={input}
          />

          {passwords.newPass && (
            <>
              <div style={bar}>
                <div style={{
                  ...fill,
                  width: `${strength.score * 25}%`,
                  background: strength.color
                }} />
              </div>
              <p style={{ color: strength.color }}>{strength.label}</p>

              <div style={rulesBox}>
                <Rule valid={passwords.newPass.length >= 8} text="8+ characters" />
                <Rule valid={/[A-Z]/.test(passwords.newPass)} text="Uppercase" />
                <Rule valid={/[0-9]/.test(passwords.newPass)} text="Number" />
                <Rule valid={/[^A-Za-z0-9]/.test(passwords.newPass)} text="Symbol" />
              </div>
            </>
          )}

          <input type="password" placeholder="Confirm Password"
            value={passwords.confirm}
            onChange={(e)=>setPasswords({...passwords,confirm:e.target.value})}
            style={input}
          />

          <button
            disabled={!isValidPassword || pwLoading}
            style={{ ...primaryBtn, opacity: isValidPassword ? 1 : 0.5 }}
            onClick={handlePasswordChange}
          >
            {pwLoading ? "Updating..." : "Update Password"}
          </button>

          {pwMessage && <p>{pwMessage}</p>}
        </div>
      )}

      {/* DRAWER */}
      {drawerOpen && (
        <div style={drawer}>
          <button onClick={()=>{setActiveTab("orders");setDrawerOpen(false)}}>Orders</button>
          <button onClick={()=>{setActiveTab("profile");setDrawerOpen(false)}}>Profile</button>
          <button onClick={()=>{setActiveTab("security");setDrawerOpen(false)}}>Security</button>
          <button onClick={()=>{localStorage.clear();navigate("/customer-login")}}>Logout</button>
        </div>
      )}
    </div>
  )
}

/* ================= STYLES ================= */

const container = { padding: 30, background: "#020617", minHeight: "100vh", color: "white" }
const header = { display: "flex", marginBottom: 20 }
const controls = { display: "flex", gap: 10, marginBottom: 20 }

const input = { padding: 10, background: "#0f172a", color: "white", borderRadius: 6 }

const card = { padding: 15, background: "#0f172a", marginBottom: 10 }
const cardHeader = { display: "flex", justifyContent: "space-between" }
const rowWrap = { display: "flex", justifyContent: "space-between" }

const accountBtn = { marginLeft: "auto" }

const drawer = { position: "fixed", right: 0, top: 0, width: 220, height: "100%", background: "#020617", padding: 20 }

const securityBox = { maxWidth: 400, margin: "20px auto", display: "flex", flexDirection: "column", gap: 10 }

const primaryBtn = { padding: 10, background: "#22c55e", borderRadius: 6 }

const bar = { height: 6, background: "#1e293b", borderRadius: 6 }
const fill = { height: "100%", borderRadius: 6 }

const rulesBox = { display: "flex", flexDirection: "column", gap: 2 }