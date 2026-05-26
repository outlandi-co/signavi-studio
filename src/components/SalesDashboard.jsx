import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"

import { io } from "socket.io-client"
import api from "../services/api"

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "https://signavi-backend.onrender.com"

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const getOrderArray = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.orders)) return data.orders

  return []
}

const isToday = (dateValue) => {
  if (!dateValue) return false

  const date = new Date(dateValue)
  const today = new Date()

  return date.toDateString() === today.toDateString()
}

const getOrderTotal = (order = {}) => {
  return Number(
    order.finalPrice ||
      order.total ||
      order.price ||
      order.subtotal ||
      0
  )
}

const paidStatuses = [
  "paid",
  "ready_for_production",
  "production",
  "shipping",
  "shipped",
  "delivered"
]

function SalesDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const socketRef = useRef(null)

  useEffect(() => {
    let mounted = true

    const loadOrders = async () => {
      try {
        setLoading(true)

        const res = await api.get("/orders")

        if (!mounted) return

        setOrders(getOrderArray(res.data))
      } catch (err) {
        console.error("❌ SALES LOAD ERROR:", err)

        if (mounted) {
          setOrders([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    const timer = setTimeout(() => {
      loadOrders()
    }, 0)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"]
      })
    }

    const socket = socketRef.current

    const upsertOrder = (order) => {
      if (!order?._id) return

      setOrders((prev) => {
        const exists = prev.some(
          (item) => item._id === order._id
        )

        if (!exists) {
          return [order, ...prev]
        }

        return prev.map((item) =>
          item._id === order._id
            ? {
                ...item,
                ...order
              }
            : item
        )
      })
    }

    const removeOrder = (order) => {
      if (!order?._id) return

      setOrders((prev) =>
        prev.filter((item) => item._id !== order._id)
      )
    }

    socket.on("connect", () => {
      console.log("🟢 Sales socket:", socket.id)
    })

    socket.on("orderCreated", upsertOrder)
    socket.on("jobCreated", upsertOrder)
    socket.on("orderUpdated", upsertOrder)
    socket.on("jobUpdated", upsertOrder)
    socket.on("orderDeleted", removeOrder)
    socket.on("jobDeleted", removeOrder)

    return () => {
      socket.off("connect")
      socket.off("orderCreated", upsertOrder)
      socket.off("jobCreated", upsertOrder)
      socket.off("orderUpdated", upsertOrder)
      socket.off("jobUpdated", upsertOrder)
      socket.off("orderDeleted", removeOrder)
      socket.off("jobDeleted", removeOrder)
    }
  }, [])

  const data = useMemo(() => {
    const paidOrders = orders.filter((order) =>
      paidStatuses.includes(order.status)
    )

    const totalRevenue = paidOrders.reduce(
      (sum, order) => sum + getOrderTotal(order),
      0
    )

    const todayRevenue = paidOrders
      .filter((order) =>
        isToday(
          order.paidAt ||
            order.updatedAt ||
            order.createdAt
        )
      )
      .reduce(
        (sum, order) => sum + getOrderTotal(order),
        0
      )

    const averageOrder =
      paidOrders.length > 0
        ? totalRevenue / paidOrders.length
        : 0

    return {
      totalRevenue,
      totalOrders: paidOrders.length,
      todayRevenue,
      averageOrder
    }
  }, [orders])

  return (
    <section style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>
            SignaVi Studio
          </p>

          <h2 style={titleStyle}>
            📊 Sales Dashboard
          </h2>

          <p style={subtitleStyle}>
            Live revenue updates from paid and production orders.
          </p>
        </div>

        <span style={liveBadge}>
          {loading ? "Loading..." : "Live"}
        </span>
      </div>

      <div style={gridStyle}>
        <Card
          title="💰 Revenue"
          value={money(data.totalRevenue)}
          color="#22c55e"
        />

        <Card
          title="📦 Orders"
          value={data.totalOrders}
          color="#3b82f6"
        />

        <Card
          title="📅 Today"
          value={money(data.todayRevenue)}
          color="#f59e0b"
        />

        <Card
          title="🧾 Avg Order"
          value={money(data.averageOrder)}
          color="#38bdf8"
        />
      </div>
    </section>
  )
}

function Card({
  title,
  value,
  color
}) {
  return (
    <div style={cardStyle(color)}>
      <h3 style={cardTitle}>
        {title}
      </h3>

      <p style={cardValue}>
        {value}
      </p>
    </div>
  )
}

const containerStyle = {
  background: "#020617",
  padding: 20,
  borderRadius: 20,
  marginBottom: 20,
  border: "1px solid #1e293b",
  color: "white"
}

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-start",
  marginBottom: 18
}

const eyebrowStyle = {
  margin: "0 0 6px",
  color: "#22d3ee",
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  fontSize: 12,
  fontWeight: 900
}

const titleStyle = {
  margin: 0,
  fontSize: 28
}

const subtitleStyle = {
  margin: "8px 0 0",
  color: "#94a3b8"
}

const liveBadge = {
  border: "1px solid rgba(34,197,94,0.4)",
  background: "rgba(34,197,94,0.12)",
  color: "#86efac",
  borderRadius: 999,
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 900
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 16
}

const cardStyle = (color) => ({
  background: "#020617",
  border: `1px solid ${color}`,
  borderRadius: 16,
  padding: 16,
  color: "white",
  boxShadow: `0 0 18px ${color}33`
})

const cardTitle = {
  margin: 0,
  color: "#cbd5e1",
  fontSize: 14
}

const cardValue = {
  margin: "10px 0 0",
  fontSize: 24,
  fontWeight: 900
}

export default SalesDashboard