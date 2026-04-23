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
  pending: { color: "#f59e0b", label: "Pending" },
  payment_required: { color: "#f97316", label: "Payment Required" },
  paid: { color: "#22c55e", label: "Paid" },
  production: { color: "#3b82f6", label: "Production" },
  shipping: { color: "#06b6d4", label: "Shipping" },
  shipped: { color: "#0ea5e9", label: "Shipped" },
  delivered: { color: "#10b981", label: "Delivered" }
}

const STATUS_FLOW = [
  "pending","payment_required","paid","production","shipping","shipped","delivered"
]

const STATUS_LABELS = {
  pending: "Pending",
  payment_required: "Payment",
  paid: "Paid",
  production: "Production",
  shipping: "Shipping",
  shipped: "Shipped",
  delivered: "Delivered"
}

const formatMoney = (n = 0) => `$${Number(n).toFixed(2)}`
const formatDate = (d) => d ? new Date(d).toLocaleDateString() : "—"

/* ================= PROGRESS ================= */
const StatusProgress = ({ status }) => {
  const index = STATUS_FLOW.indexOf(status)

  return (
    <div style={{ marginTop: 12 }}>
      <div style={progressLabels}>
        {STATUS_FLOW.map((s, i) => (
          <span key={i}>{STATUS_LABELS[s]}</span>
        ))}
      </div>

      <div style={progressBar}>
        <div
          style={{
            ...progressFill,
            width: `${((index + 1) / STATUS_FLOW.length) * 100}%`
          }}
        />
      </div>
    </div>
  )
}

/* ================= ORDER CARD ================= */
const OrderCard = ({ order, onClick, onReorder, highlight }) => {
  const meta = STATUS_META[order.status] || { color: "#64748b", label: order.status }

  return (
    <div
      style={{
        ...card,
        animation: highlight ? "pulse 0.6s ease" : "none"
      }}
      onClick={() => onClick(order)}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={muted}>Order</div>
          <div style={{ fontWeight: 600 }}>
            #{order._id.slice(-6)}
          </div>
        </div>

        <div style={{ ...badge, background: meta.color }}>
          {meta.label}
        </div>
      </div>

      <div style={rowWrap}>
        <div>
          <div style={muted}>Items</div>
          <div>{order.items?.length || 0}</div>
        </div>

        <div>
          <div style={muted}>Total</div>
          <div>{formatMoney(order.finalPrice || order.price)}</div>
        </div>

        <div>
          <div style={muted}>Date</div>
          <div>{formatDate(order.createdAt)}</div>
        </div>
      </div>

      <StatusProgress status={order.status} />

      <button
        onClick={(e) => {
          e.stopPropagation()
          onReorder(order)
        }}
        style={smallBtn}
      >
        Reorder
      </button>
    </div>
  )
}

/* ================= MODAL ================= */
const OrderModal = ({ order, onClose }) => {
  if (!order) return null

  return (
    <>
      <div style={overlay} onClick={onClose} />

      <div style={modal}>
        <button onClick={onClose} style={closeBtn}>✕</button>

        <h2>Order Details</h2>
        <p><b>ID:</b> {order._id}</p>
        <p><b>Status:</b> {order.status}</p>

        <StatusProgress status={order.status} />

        <h3>Items</h3>
        {order.items?.map((item, i) => (
          <div key={i} style={itemRow}>
            <span>{item.name}</span>
            <span>x{item.quantity}</span>
            <span>${item.price}</span>
          </div>
        ))}
      </div>
    </>
  )
}

/* ================= MAIN ================= */
export default function CustomerDashboard() {

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [highlightId, setHighlightId] = useState(null)

  // 🔥 NEW
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const socketRef = useRef(null)
  const navigate = useNavigate()

  const storedUser = JSON.parse(localStorage.getItem("customerUser") || "null")

  useEffect(() => {
    if (!storedUser) navigate("/customer-login")
  }, [storedUser, navigate])

  /* LOAD */
  useEffect(() => {
    if (!storedUser) return

    api.get("/orders/my-orders").then(res => {
      const safe = Array.isArray(res.data)
        ? res.data
        : res.data?.data || []
      setOrders(safe)
      setLoading(false)
    })
  }, [storedUser])

  /* SOCKET */
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL)
    }

    const socket = socketRef.current

    socket.on("jobUpdated", (updated) => {
      setOrders(prev => prev.map(o => o._id === updated._id ? updated : o))
      setHighlightId(updated._id)
      setTimeout(() => setHighlightId(null), 700)
    })

    socket.on("jobCreated", (newOrder) => {
      setOrders(prev => [newOrder, ...prev])
      setHighlightId(newOrder._id)
      setTimeout(() => setHighlightId(null), 700)
    })

    return () => {
      socket.off("jobUpdated")
      socket.off("jobCreated")
    }
  }, [])

  const handleReorder = async (order) => {
    await api.post("/orders", { items: order.items })
  }

  /* 🔥 FILTER + SORT */
  const processedOrders = orders
    .filter(o => {
      const matchesSearch =
        o._id.toLowerCase().includes(search.toLowerCase()) ||
        o.status.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === "all" || o.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === "price-high") return (b.finalPrice || b.price) - (a.finalPrice || a.price)
      if (sortBy === "price-low") return (a.finalPrice || a.price) - (b.finalPrice || b.price)
      return 0
    })

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>My Orders</h2>

      {/* 🔥 CONTROLS */}
      <div style={controls}>
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={input}
        />

        <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} style={select}>
          <option value="all">All</option>
          {Object.keys(STATUS_META).map(s => (
            <option key={s} value={s}>{STATUS_META[s].label}</option>
          ))}
        </select>

        <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} style={select}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price-high">Price High</option>
          <option value="price-low">Price Low</option>
        </select>
      </div>

      {loading && <div>Loading...</div>}

      {!loading && processedOrders.map(o => (
        <OrderCard
          key={o._id}
          order={o}
          onClick={setSelectedOrder}
          onReorder={handleReorder}
          highlight={highlightId === o._id}
        />
      ))}

      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      <style>
        {`
          @keyframes pulse {
            0% { box-shadow: 0 0 0 rgba(34,197,94,0.0); }
            50% { box-shadow: 0 0 12px rgba(34,197,94,0.25); }
            100% { box-shadow: 0 0 0 rgba(34,197,94,0.0); }
          }
        `}
      </style>
    </div>
  )
}

/* ================= STYLES ================= */

const card = { background:"#020617", border:"1px solid #1e293b", borderRadius:10, padding:14, marginBottom:12, cursor:"pointer" }
const muted = { fontSize:12, opacity:0.6 }
const badge = { padding:"4px 10px", borderRadius:20, fontSize:12, fontWeight:600, color:"#020617" }
const rowWrap = { display:"flex", justifyContent:"space-between", marginTop:10 }
const smallBtn = { marginTop:10, padding:"4px 10px", background:"#22c55e", border:"none", cursor:"pointer" }

const progressLabels = { display:"flex", justifyContent:"space-between", fontSize:10, opacity:0.6 }
const progressBar = { height:6, background:"#1e293b", borderRadius:6, marginTop:6 }
const progressFill = { height:"100%", background:"#22c55e", borderRadius:6, transition:"0.4s ease" }

const overlay = { position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:1000 }
const modal = { position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"90%", maxWidth:600, background:"#020617", padding:20, zIndex:2001 }
const closeBtn = { position:"absolute", top:10, right:10, background:"transparent", border:"none", color:"white" }

const itemRow = { display:"flex", justifyContent:"space-between", padding:6 }

const controls = { display:"flex", gap:10, marginBottom:15, flexWrap:"wrap" }
const input = { padding:8, background:"#0f172a", border:"1px solid #334155", color:"white", borderRadius:6 }
const select = { padding:8, background:"#0f172a", border:"1px solid #334155", color:"white", borderRadius:6 }