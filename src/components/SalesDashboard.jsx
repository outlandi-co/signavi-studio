import { useEffect, useState } from "react"
import { io } from "socket.io-client"

function SalesDashboard() {
  const [data, setData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    todayRevenue: 0
  })

  /* ================= SOCKET LIVE ================= */
  useEffect(() => {
    const socket = io("https://signavi-backend.onrender.com")

    socket.on("connect", () => {
      console.log("🟢 Sales socket:", socket.id)
    })

    socket.on("jobUpdated", (order) => {
      console.log("📊 Sales update:", order)

      // Only update if relevant
      if (!["paid", "shipping", "archive"].includes(order.status)) return

      setData(prev => {
        const price = Number(order.finalPrice || 0)

        return {
          totalRevenue:
            order.status === "paid"
              ? prev.totalRevenue + price
              : prev.totalRevenue,

          totalOrders:
            order.status === "paid"
              ? prev.totalOrders + 1
              : prev.totalOrders,

          todayRevenue:
            order.status === "paid"
              ? prev.todayRevenue + price
              : prev.todayRevenue
        }
      })
    })

    return () => socket.disconnect()
  }, [])

  return (
    <div style={containerStyle}>
      <h2 style={{ color: "white", marginBottom: "15px" }}>
        📊 Sales Dashboard (Live)
      </h2>

      <div style={gridStyle}>
        <Card title="💰 Revenue" value={`$${data.totalRevenue.toFixed(2)}`} color="#22c55e" />
        <Card title="📦 Orders" value={data.totalOrders} color="#3b82f6" />
        <Card title="📅 Today" value={`$${data.todayRevenue.toFixed(2)}`} color="#f59e0b" />
      </div>
    </div>
  )
}

/* ================= UI ================= */
const Card = ({ title, value, color }) => (
  <div style={cardStyle(color)}>
    <h3>{title}</h3>
    <p style={{ fontSize: "22px", fontWeight: "bold" }}>{value}</p>
  </div>
)

const containerStyle = {
  background: "#020617",
  padding: "20px",
  borderRadius: "12px",
  marginBottom: "20px",
  border: "1px solid #1e293b"
}

const gridStyle = {
  display: "flex",
  gap: "20px",
  flexWrap: "wrap"
}

const cardStyle = (color) => ({
  flex: "1",
  minWidth: "150px",
  background: "#020617",
  border: `1px solid ${color}`,
  borderRadius: "10px",
  padding: "15px",
  color: "white",
  boxShadow: `0 0 10px ${color}`
})

export default SalesDashboard