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

const getStatusColor = (status) => {
  switch (status) {
    case "paid": return "#22c55e"
    case "production": return "#3b82f6"
    case "shipped": return "#a855f7"
    case "delivered": return "#10b981"
    case "pending": return "#f97316"
    default: return "#64748b"
  }
}

/* ================= ORDER CARD ================= */
const OrderCard = ({ order }) => (
  <div style={card}>
    <div style={cardHeader}>
      <b>#{order._id.slice(-6)}</b>
      <span style={{ color: getStatusColor(order.status) }}>
        {order.status}
      </span>
    </div>

    <div style={rowWrap}>
      <span>{formatMoney(order.finalPrice || order.price)}</span>
      <span>{formatDate(order.createdAt)}</span>
    </div>

    {order.trackingNumber && (
      <div style={{ marginTop: 10 }}>
        <p style={{ fontSize: 12 }}>
          📦 {order.carrier || "Carrier"}: {order.trackingNumber}
        </p>

        {order.trackingLink && (
          <a
            href={order.trackingLink}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#22c55e", fontSize: 12 }}
          >
            Track Package →
          </a>
        )}
      </div>
    )}
  </div>
)

export default function CustomerDashboard() {

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [drawerOpen, setDrawerOpen] = useState(false)

  const socketRef = useRef(null)
  const navigate = useNavigate()

  const storedUser = JSON.parse(localStorage.getItem("customerUser") || "null")

  /* 🔐 PROTECT ROUTE */
  useEffect(() => {
    if (!storedUser) navigate("/customer-login")
  }, [storedUser, navigate])

  /* 📦 LOAD ORDERS */
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)

        const res = await api.get("/orders/my-orders")

        console.log("📦 MY ORDERS:", res.data)

        const safe = Array.isArray(res.data)
          ? res.data
          : res.data?.data || []

        setOrders(safe)

      } catch (err) {
        console.error("❌ LOAD ORDERS ERROR:", err)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  /* 📡 SOCKET LIVE UPDATES */
  useEffect(() => {
    if (!socketRef.current) socketRef.current = io(SOCKET_URL)

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

  /* 🔎 FILTER */
  const processedOrders = orders.filter(o =>
    o._id.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter === "all" || o.status === statusFilter)
  )

  return (
    <div style={container}>

      {/* HEADER */}
      <div style={header}>
        <h2>Dashboard</h2>

        <button
          style={accountBtn}
          onClick={() => setDrawerOpen(true)}
        >
          Account
        </button>
      </div>

      {/* FILTERS */}
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
          <option value="shipped">Shipped</option>
        </select>
      </div>

      {/* UI STATES */}
      {loading && <p>Loading...</p>}

      {!loading && processedOrders.length === 0 && (
        <p>No orders found</p>
      )}

      {!loading && processedOrders.map(o => (
        <OrderCard key={o._id} order={o} />
      ))}

      {/* ACCOUNT DRAWER */}
      {drawerOpen && (
        <>
          <div style={overlay} onClick={()=>setDrawerOpen(false)} />

          <div style={drawer}>
            <h3>Account</h3>

            <button
              style={drawerBtn}
              onClick={()=>setDrawerOpen(false)}
            >
              Close
            </button>

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
const container = { padding: 30, background: "#020617", minHeight: "100vh", color: "white" }
const header = { display: "flex", marginBottom: 20 }
const controls = { display: "flex", gap: 10, marginBottom: 20 }
const input = { padding: 10, background: "#0f172a", color: "white", borderRadius: 6 }
const card = { padding: 15, background: "#0f172a", marginBottom: 10, borderRadius: 8 }
const cardHeader = { display: "flex", justifyContent: "space-between" }
const rowWrap = { display: "flex", justifyContent: "space-between" }

const accountBtn = {
  marginLeft: "auto",
  padding: "8px 16px",
  background: "#22c55e",
  color: "black",
  borderRadius: 6,
  cursor: "pointer"
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)"
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
  gap: 10
}

const drawerBtn = {
  padding: 12,
  background: "#0f172a",
  color: "white",
  borderRadius: 6
}

const logoutBtn = {
  marginTop: "auto",
  background: "#ef4444",
  padding: 12,
  borderRadius: 6
}