import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

export default function NotificationCenter() {

  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/notifications", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        })

        setNotifications(res.data)

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const markAllRead = async () => {
    await api.put("/notifications/read", {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })

    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const filtered = filter === "all"
    ? notifications
    : notifications.filter(n => n.type === filter)

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>

  return (
    <div style={container}>

      <div style={header}>
        <h1>🔔 Notifications</h1>

        <button onClick={markAllRead} style={btn}>
          Mark All Read
        </button>
      </div>

      {/* FILTERS */}
      <div style={filters}>
        {["all","order","payment","admin","system"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...filterBtn,
              background: filter === f ? "#06b6d4" : "#020617"
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div style={list}>
        {filtered.map(n => (
          <div
            key={n._id}
            onClick={() => navigate(`/order/${n.orderId}`)}
            style={{
              ...card,
              borderLeft: `4px solid ${getColor(n.type)}`,
              background: n.read ? "#020617" : "#1e293b"
            }}
          >
            <p>{n.text}</p>
            <small>{new Date(n.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>

    </div>
  )
}

/* TYPE COLORS */
const getColor = (type) => {
  switch (type) {
    case "order": return "#22c55e"
    case "payment": return "#3b82f6"
    case "admin": return "#f59e0b"
    default: return "#64748b"
  }
}

/* STYLES */
const container = { padding: 40, color: "white" }

const header = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 20
}

const filters = {
  display: "flex",
  gap: 10,
  marginBottom: 20
}

const filterBtn = {
  padding: "6px 12px",
  border: "none",
  borderRadius: 6,
  color: "white",
  cursor: "pointer"
}

const list = {
  display: "flex",
  flexDirection: "column",
  gap: 10
}

const card = {
  padding: 15,
  borderRadius: 10,
  cursor: "pointer"
}

const btn = {
  background: "#22c55e",
  padding: "6px 12px",
  border: "none",
  borderRadius: 6
}