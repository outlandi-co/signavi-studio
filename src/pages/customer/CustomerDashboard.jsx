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

/* ================= HELPERS ================= */
const formatMoney = (n = 0) => `$${Number(n).toFixed(2)}`
const formatDate = (d) => d ? new Date(d).toLocaleDateString() : "—"

/* ================= SKELETON ================= */
const SkeletonCard = () => (
  <div style={skeletonCard}>
    <div style={skeletonHeader} />
    <div style={skeletonRow} />
    <div style={skeletonRow} />
    <div style={skeletonBar} />
  </div>
)

/* ================= PROGRESS ================= */
const StatusProgress = ({ status }) => {
  const index = STATUS_FLOW.indexOf(status)

  return (
    <div style={{ marginTop: 10 }}>
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

/* ================= CARD ================= */
const OrderCard = ({ order, highlight }) => {
  const meta = STATUS_META[order.status] || {}

  return (
    <div
      style={{
        ...card,
        animation: highlight ? "pulse 0.6s ease" : "none",
        transition: "transform 0.2s ease",
      }}
    >
      <div style={cardHeader}>
        <div>
          <div style={muted}>Order</div>
          <b>#{order._id.slice(-6)}</b>
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
    </div>
  )
}

/* ================= MAIN ================= */
export default function CustomerDashboard() {

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [highlightId, setHighlightId] = useState(null)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("orders")
  const [viewKey, setViewKey] = useState(0)

  const socketRef = useRef(null)
  const navigate = useNavigate()

  const storedUser = JSON.parse(localStorage.getItem("customerUser") || "null")

  useEffect(() => {
    if (!storedUser) navigate("/customer-login")
  }, [storedUser, navigate])

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

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL)
    }

    const socket = socketRef.current

    socket.on("jobUpdated", (updated) => {
      setOrders(prev => prev.map(o => o._id === updated._id ? updated : o))
      setHighlightId(updated._id)
      setTimeout(() => setHighlightId(null), 600)
    })

    socket.on("jobCreated", (newOrder) => {
      setOrders(prev => [newOrder, ...prev])
      setHighlightId(newOrder._id)
      setTimeout(() => setHighlightId(null), 600)
    })

    return () => {
      socket.off("jobUpdated")
      socket.off("jobCreated")
    }
  }, [])

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
      if (sortBy === "price-high") return (b.finalPrice || b.price) - (a.finalPrice || a.price)
      if (sortBy === "price-low") return (a.finalPrice || a.price) - (b.finalPrice || b.price)
      return 0
    })

  return (
    <div style={{ padding: 20, color: "white" }}>

      <div style={{ display: "flex", alignItems: "center" }}>
        <h2>Dashboard</h2>
        <button onClick={() => setDrawerOpen(true)} style={accountBtn}>
          Account
        </button>
      </div>

      <div key={viewKey} style={animatedView}>

        {activeTab === "orders" && (
          <>
            <div style={controls}>
              <input value={search} onChange={(e)=>setSearch(e.target.value)} style={input} placeholder="Search..." />
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

            {loading && [...Array(4)].map((_,i)=><SkeletonCard key={i}/>)}

            {!loading && processedOrders.length === 0 && (
              <div style={emptyState}>
                <h3>No Orders Yet</h3>
                <p>Your orders will appear here.</p>
              </div>
            )}

            {!loading && processedOrders.map(o => (
              <OrderCard key={o._id} order={o} highlight={highlightId === o._id} />
            ))}
          </>
        )}

        {activeTab === "profile" && (
          <div>
            <h2>Profile</h2>
            <p>{storedUser?.name}</p>
            <p>{storedUser?.email}</p>
          </div>
        )}

        {activeTab === "security" && (
          <div>
            <h2>Security</h2>
            <p>Password tools coming 🔐</p>
          </div>
        )}

      </div>

      {drawerOpen && (
        <>
          <div style={overlay} onClick={()=>setDrawerOpen(false)} />
          <div style={drawer}>
            <button style={drawerBtn} onClick={()=>{setActiveTab("orders");setViewKey(v=>v+1);setDrawerOpen(false)}}>Orders</button>
            <button style={drawerBtn} onClick={()=>{setActiveTab("profile");setViewKey(v=>v+1);setDrawerOpen(false)}}>Profile</button>
            <button style={drawerBtn} onClick={()=>{setActiveTab("security");setViewKey(v=>v+1);setDrawerOpen(false)}}>Security</button>
            <button style={logout} onClick={()=>{localStorage.clear();navigate("/customer-login")}}>Logout</button>
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 rgba(34,197,94,0); }
          50% { box-shadow: 0 0 10px rgba(34,197,94,0.25); }
          100% { box-shadow: 0 0 0 rgba(34,197,94,0); }
        }
        @keyframes fadeSlide {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

/* ================= STYLES ================= */

const animatedView = { maxWidth:800, margin:"40px auto", animation:"fadeSlide 0.35s ease" }

const skeletonCard = { background:"#020617", border:"1px solid #1e293b", borderRadius:10, padding:14, marginBottom:12 }
const skeletonHeader = { height:14, width:"40%", background:"#1e293b", marginBottom:10 }
const skeletonRow = { height:12, background:"#1e293b", marginBottom:8 }
const skeletonBar = { height:6, background:"#1e293b" }

const emptyState = { textAlign:"center", marginTop:60 }

const controls = { display:"flex", gap:10, marginBottom:20 }
const input = { padding:8, background:"#0f172a", color:"white", borderRadius:6 }
const select = { padding:8, background:"#0f172a", color:"white", borderRadius:6 }

const card = { background:"#020617", border:"1px solid #1e293b", borderRadius:10, padding:14, marginBottom:12 }
const cardHeader = { display:"flex", justifyContent:"space-between" }
const muted = { fontSize:12, opacity:0.6 }
const badge = { padding:"4px 10px", borderRadius:20, color:"#020617" }
const rowWrap = { display:"flex", justifyContent:"space-between", marginTop:10 }

const progressLabels = { display:"flex", justifyContent:"space-between", fontSize:10 }
const progressBar = { height:6, background:"#1e293b", borderRadius:6 }
const progressFill = { height:"100%", background:"#22c55e" }

const overlay = { position:"fixed", inset:0, background:"rgba(0,0,0,0.6)" }
const drawer = { position:"fixed", right:0, top:0, width:260, height:"100%", background:"#020617", padding:20 }
const drawerBtn = { width:"100%", padding:10, marginBottom:10, background:"#0f172a", color:"white", borderRadius:6 }
const logout = { marginTop:20, background:"#ef4444", padding:10, width:"100%" }

const accountBtn = { marginLeft:"auto", padding:"6px 12px", background:"#020617", border:"1px solid #1e293b", color:"white", borderRadius:6 }