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

  return (
    <div style={container}>

      {/* HEADER */}
      <div style={header}>
        <h2>Dashboard</h2>
        <button style={accountBtn} onClick={() => setDrawerOpen(true)}>
          Account
        </button>
      </div>

      {/* CONTROLS */}
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
          {Object.keys(STATUS_META).map(s => (
            <option key={s} value={s}>{STATUS_META[s].label}</option>
          ))}
        </select>
      </div>

      {/* ORDERS */}
      {activeTab === "orders" && (
        <>
          {loading && <p>Loading...</p>}
          {!loading && processedOrders.length === 0 && <p>No orders yet</p>}
          {!loading && processedOrders.map(o => (
            <OrderCard key={o._id} order={o} />
          ))}
        </>
      )}

      {/* PROFILE */}
      {activeTab === "profile" && (
        <div style={panel}>
          <h2>Profile</h2>
          <p><b>Name:</b> {storedUser?.name}</p>
          <p><b>Email:</b> {storedUser?.email}</p>
        </div>
      )}

      {/* SECURITY */}
      {activeTab === "security" && (
        <div style={panel}>
          <h2>Security</h2>
          <p>Password tools coming 🔐</p>
        </div>
      )}

      {/* DRAWER */}
      {drawerOpen && (
        <>
          <div style={overlay} onClick={()=>setDrawerOpen(false)} />

          <div style={drawer}>
            <h3 style={{ marginBottom: 20 }}>Account</h3>

            <div style={navStack}>
              <button
                style={{
                  ...drawerBtn,
                  ...(activeTab === "orders" ? activeStyle : {})
                }}
                onClick={()=>{
                  setActiveTab("orders")
                  setDrawerOpen(false)
                }}
              >
                Orders
              </button>

              <button
                style={{
                  ...drawerBtn,
                  ...(activeTab === "profile" ? activeStyle : {})
                }}
                onClick={()=>{
                  setActiveTab("profile")
                  setDrawerOpen(false)
                }}
              >
                Profile
              </button>

              <button
                style={{
                  ...drawerBtn,
                  ...(activeTab === "security" ? activeStyle : {})
                }}
                onClick={()=>{
                  setActiveTab("security")
                  setDrawerOpen(false)
                }}
              >
                Security
              </button>
            </div>

            <button
              style={logoutBtn}
              onClick={()=>{
                localStorage.clear()
                navigate("/customer-login")
              }}
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/* ================= STYLES ================= */

const container = {
  padding: 30,
  background: "#020617",
  minHeight: "100vh",
  color: "white"
}

const header = {
  display: "flex",
  marginBottom: 20
}

const controls = {
  display: "flex",
  gap: 10,
  marginBottom: 20
}

const input = {
  padding: 10,
  background: "#0f172a",
  color: "white",
  borderRadius: 6,
  border: "1px solid #1e293b"
}

const card = {
  padding: 15,
  background: "#0f172a",
  marginBottom: 10,
  borderRadius: 8
}

const cardHeader = {
  display: "flex",
  justifyContent: "space-between"
}

const rowWrap = {
  display: "flex",
  justifyContent: "space-between"
}

const panel = {
  maxWidth: 400,
  margin: "40px auto"
}

const accountBtn = {
  marginLeft: "auto",
  padding: "8px 16px",
  borderRadius: 6,
  background: "#22c55e",
  border: "none",
  cursor: "pointer"
}

/* DRAWER */
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  zIndex: 999
}

const drawer = {
  position: "fixed",
  right: 0,
  top: 0,
  width: 260,
  height: "100%",
  background: "#020617",
  padding: 20,
  display: "flex",
  flexDirection: "column",
  borderLeft: "1px solid #1e293b",
  zIndex: 1000
}

const navStack = {
  display: "flex",
  flexDirection: "column",
  gap: 8
}

const drawerBtn = {
  width: "100%",
  padding: "12px 14px",
  background: "transparent",
  borderRadius: 8,
  color: "#cbd5f5",
  textAlign: "left",
  cursor: "pointer"
}

const activeStyle = {
  background: "#0f172a",
  border: "1px solid #334155",
  color: "white"
}

const logoutBtn = {
  marginTop: "auto",
  padding: "12px",
  background: "#ef4444",
  borderRadius: 8,
  border: "none",
  color: "white",
  cursor: "pointer"
}