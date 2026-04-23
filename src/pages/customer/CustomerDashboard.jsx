import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import { io } from "socket.io-client"

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const SOCKET_URL = API_URL.replace("/api", "")

/* ================= HELPERS ================= */
const formatMoney = (n = 0) => `$${Number(n).toFixed(2)}`
const formatDate = (d) => d ? new Date(d).toLocaleDateString() : "—"

/* ================= PASSWORD ================= */
const Rule = ({ valid, text }) => (
  <div style={{ fontSize: 12, color: valid ? "#22c55e" : "#64748b" }}>
    {valid ? "✔" : "•"} {text}
  </div>
)

const getStrength = (password) => {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"]
  const labels = ["Weak", "Fair", "Good", "Strong"]

  return {
    score,
    color: colors[score - 1] || "#ef4444",
    label: labels[score - 1] || "Weak"
  }
}

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

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("orders")

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: ""
  })

  const [showPw, setShowPw] = useState(false)

  const [pwLoading, setPwLoading] = useState(false)
  const [pwMessage, setPwMessage] = useState("")
  const [toast, setToast] = useState("")

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

  const processedOrders = orders.filter(o =>
    o._id.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter === "all" || o.status === statusFilter)
  )

  const isValidPassword =
    passwords.current &&
    passwords.newPass.length >= 8 &&
    /[A-Z]/.test(passwords.newPass) &&
    /[0-9]/.test(passwords.newPass) &&
    /[^A-Za-z0-9]/.test(passwords.newPass) &&
    passwords.newPass === passwords.confirm

  const handlePasswordChange = async () => {
    try {
      setPwLoading(true)
      setPwMessage("")

      await api.post("/auth/change-password", {
        currentPassword: passwords.current,
        newPassword: passwords.newPass
      })

      setPwMessage("✅ Password updated")
      setToast("Password updated successfully 🎉")
      setTimeout(() => setToast(""), 3000)

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
        <button style={accountBtn} onClick={() => setDrawerOpen(true)}>
          Account
        </button>
      </div>

      <div style={controls}>
        <input
          placeholder="Search..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          style={input}
        />

        <select
          value={statusFilter}
          onChange={(e)=>setStatusFilter(e.target.value)}
          style={input}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="production">Production</option>
        </select>
      </div>

      {activeTab === "orders" && (
        <>
          {loading && <p>Loading...</p>}
          {!loading && processedOrders.map(o => (
            <OrderCard key={o._id} order={o} />
          ))}
        </>
      )}

      {activeTab === "profile" && (
        <div style={panel}>
          <h2>Profile</h2>
          <p><b>Name:</b> {storedUser?.name}</p>
          <p><b>Email:</b> {storedUser?.email}</p>
        </div>
      )}

      {/* 🔐 SECURITY */}
      {activeTab === "security" && (
        <div style={securityBox}>
          <h2>Change Password</h2>

          <label style={label}>Current Password</label>
          <input type={showPw ? "text" : "password"}
            value={passwords.current}
            onChange={(e)=>setPasswords({...passwords,current:e.target.value})}
            style={input}
          />

          <label style={label}>New Password</label>
          <input type={showPw ? "text" : "password"}
            value={passwords.newPass}
            onChange={(e)=>setPasswords({...passwords,newPass:e.target.value})}
            style={input}
          />

          {/* STRENGTH */}
          {passwords.newPass && (() => {
            const s = getStrength(passwords.newPass)
            return (
              <>
                <div style={strengthBar}>
                  <div style={{ ...strengthFill, width: `${s.score * 25}%`, background: s.color }} />
                </div>
                <p style={{ color: s.color }}>{s.label}</p>
              </>
            )
          })()}

          <div style={rulesBox}>
            <Rule valid={passwords.newPass.length >= 8} text="8+ characters" />
            <Rule valid={/[A-Z]/.test(passwords.newPass)} text="Uppercase" />
            <Rule valid={/[0-9]/.test(passwords.newPass)} text="Number" />
            <Rule valid={/[^A-Za-z0-9]/.test(passwords.newPass)} text="Symbol" />
          </div>

          <label style={label}>Confirm Password</label>
          <input type={showPw ? "text" : "password"}
            value={passwords.confirm}
            onChange={(e)=>setPasswords({...passwords,confirm:e.target.value})}
            style={input}
          />

          <button onClick={()=>setShowPw(!showPw)} style={toggleBtn}>
            {showPw ? "Hide Passwords" : "Show Passwords"}
          </button>

          <button
            style={{ ...primaryBtn, opacity: isValidPassword ? 1 : 0.5 }}
            disabled={!isValidPassword || pwLoading}
            onClick={handlePasswordChange}
          >
            {pwLoading ? "Updating..." : "Update Password"}
          </button>

          {pwMessage && <p>{pwMessage}</p>}
        </div>
      )}

      {drawerOpen && (
        <>
          <div style={overlay} onClick={()=>setDrawerOpen(false)} />
          <div style={drawer}>
            <h3>Account</h3>
            <div style={navStack}>
              <button style={drawerBtn} onClick={()=>{setActiveTab("orders");setDrawerOpen(false)}}>Orders</button>
              <button style={drawerBtn} onClick={()=>{setActiveTab("profile");setDrawerOpen(false)}}>Profile</button>
              <button style={drawerBtn} onClick={()=>{setActiveTab("security");setDrawerOpen(false)}}>Security</button>
            </div>
            <button style={logoutBtn} onClick={()=>{localStorage.clear();navigate("/customer-login")}}>
              Logout
            </button>
          </div>
        </>
      )}

      {toast && <div style={toastStyle}>{toast}</div>}
    </div>
  )
}

/* ================= STYLES ================= */

const container = { padding: 30, background: "#020617", minHeight: "100vh", color: "white" }
const header = { display: "flex", marginBottom: 20 }
const controls = { display: "flex", gap: 10, marginBottom: 20 }
const input = { padding: 10, background: "#0f172a", color: "white", borderRadius: 6 }
const card = { padding: 15, background: "#0f172a", marginBottom: 10, borderRadius: 8 }
const cardHeader = { display: "flex", justifyContent: "space-between" }
const rowWrap = { display: "flex", justifyContent: "space-between" }
const panel = { maxWidth: 400, margin: "40px auto" }
const accountBtn = { marginLeft: "auto", padding: "8px 16px", background: "#22c55e" }
const securityBox = { maxWidth: 400, margin: "40px auto", display: "flex", flexDirection: "column", gap: 10 }
const label = { fontSize: 12 }
const rulesBox = { display: "flex", flexDirection: "column", gap: 4 }
const primaryBtn = { padding: 12, background: "#22c55e" }
const toggleBtn = { padding: 8, background: "#334155", color: "white", borderRadius: 6 }
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)" }
const drawer = { position: "fixed", right: 0, top: 0, width: 260, height: "100%", background: "#020617", padding: 20, display: "flex", flexDirection: "column" }
const navStack = { display: "flex", flexDirection: "column", gap: 10 }
const drawerBtn = { padding: 12, background: "#0f172a", color: "white" }
const logoutBtn = { marginTop: "auto", background: "#ef4444", padding: 12 }
const strengthBar = { height: 6, background: "#1e293b", borderRadius: 6 }
const strengthFill = { height: "100%", transition: "0.3s" }
const toastStyle = { position: "fixed", bottom: 20, right: 20, background: "#22c55e", padding: 12, borderRadius: 8 }