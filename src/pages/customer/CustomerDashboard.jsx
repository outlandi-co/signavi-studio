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

  /* 🔐 PASSWORD */
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: ""
  })

  const [pwLoading, setPwLoading] = useState(false)
  const [pwMessage, setPwMessage] = useState("")

  const [accountOpen, setAccountOpen] = useState(false)

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
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"]
      })
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

  /* ================= PAYMENT ================= */
  const handlePayment = async (e, id) => {
    e.stopPropagation()

    try {
      const res = await api.post(`/square/create-payment/${id}`)
      window.location.href = res.data.url
    } catch {
      alert("Payment failed")
    }
  }

  /* ================= REORDER ================= */
  const handleReorder = async (order) => {
    try {
      await api.post("/orders", {
        ...order,
        status: "payment_required"
      })
      alert("Reorder created!")
    } catch {
      alert("Failed")
    }
  }

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

  /* ================= STATUS ================= */
  const steps = ["payment_required","paid","production","shipping","delivered"]

  const getIndex = (status) => {
    const i = steps.indexOf(status)
    return i === -1 ? 0 : i
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

      {/* ORDERS */}
      <div>
        <h1>📦 My Orders</h1>

        <div style={grid}>
          {orders.map(order => {
            const current = getIndex(order.status)

            return (
              <div
                key={order._id}
                style={card}
                onClick={() => navigate(`/order/${order._id}`)}
              >
                <div style={cardHeader}>
                  <span>#{order._id.slice(-6)}</span>
                  <span>{order.status}</span>
                </div>

                <div style={price}>
                  ${(order.finalPrice || order.price || 0).toFixed(2)}
                </div>

                <div style={timeline}>
                  {steps.map((step, i) => (
                    <div key={i} style={{
                      flex: 1,
                      height: 6,
                      background: i <= current ? "#22c55e" : "#1e293b"
                    }} />
                  ))}
                </div>

                <div style={footer}>
                  {order.status === "payment_required" && (
                    <button onClick={(e)=>handlePayment(e, order._id)} style={payBtn}>
                      💳 Pay
                    </button>
                  )}

                  <button
                    onClick={(e)=>{
                      e.stopPropagation()
                      handleReorder(order)
                    }}
                    style={reorderBtn}
                  >
                    🔁 Reorder
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* OVERLAY */}
      {accountOpen && <div style={overlay} onClick={()=>setAccountOpen(false)} />}

      {/* DRAWER */}
      <div style={{
        ...drawer,
        transform: accountOpen ? "translateX(0)" : "translateX(100%)"
      }}>
        <h2>👤 Account</h2>

        {user && (
          <>
            <p>{user.name}</p>
            <p style={{ opacity: 0.6 }}>{user.email}</p>
          </>
        )}

        <h3 style={{ marginTop: 20 }}>🔐 Password</h3>

        <input
          type="password"
          placeholder="Current"
          value={passwords.current}
          onChange={(e)=>setPasswords({...passwords, current:e.target.value})}
          style={input}
        />

        <input
          type="password"
          placeholder="New"
          value={passwords.newPass}
          onChange={(e)=>setPasswords({...passwords, newPass:e.target.value})}
          style={input}
        />

        <input
          type="password"
          placeholder="Confirm"
          value={passwords.confirm}
          onChange={(e)=>setPasswords({...passwords, confirm:e.target.value})}
          style={input}
        />

        <button
          onClick={handlePasswordChange}
          disabled={pwLoading}
          style={{
            ...button,
            opacity: pwLoading ? 0.6 : 1
          }}
        >
          {pwLoading ? "Updating..." : "Update Password"}
        </button>

        {pwLoading && (
          <p style={{ opacity: 0.6 }}>Updating password...</p>
        )}

        {pwMessage && <p>{pwMessage}</p>}

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
  )
}

/* ================= STYLES ================= */

const container = { padding: 40, color: "white" }
const grid = { display: "grid", gap: 20 }
const card = { background:"#020617", padding:20, borderRadius:12, cursor:"pointer" }
const cardHeader = { display:"flex", justifyContent:"space-between" }
const price = { fontSize:20 }
const timeline = { display:"flex", gap:4 }
const footer = { marginTop:10, display:"flex", gap:10 }

const payBtn = { background:"#22c55e", border:"none", padding:6 }
const reorderBtn = { background:"#3b82f6", border:"none", padding:6 }

const accountBtn = {
  position:"fixed",
  top:20,
  right:20,
  background:"#3b82f6",
  padding:"10px",
  border:"none",
  borderRadius:6,
  color:"white",
  cursor:"pointer"
}

const overlay = {
  position:"fixed",
  top:0,
  left:0,
  width:"100%",
  height:"100%",
  background:"rgba(0,0,0,0.5)"
}

const drawer = {
  position:"fixed",
  top:0,
  right:0,
  width:320,
  height:"100%",
  background:"#020617",
  padding:20,
  transition:"0.3s"
}

const input = {
  width:"100%",
  padding:10,
  marginTop:10,
  background:"#0f172a",
  color:"white",
  border:"1px solid #334155"
}

const button = {
  width:"100%",
  marginTop:10,
  padding:10,
  background:"#22c55e",
  border:"none"
}

const logoutBtn = {
  marginTop:20,
  width:"100%",
  padding:10,
  background:"#ef4444",
  border:"none"
}