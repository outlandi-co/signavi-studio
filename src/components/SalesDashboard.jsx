import { useEffect, useState } from "react"
import api from "../services/api"

function SalesDashboard() {
  const [data, setData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    todayRevenue: 0
  })

  const [loading, setLoading] = useState(true)

  const loadSales = async () => {
    try {
      const res = await api.get("/orders/sales")
      setData(res.data)
    } catch (err) {
      console.error("❌ SALES LOAD ERROR:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSales()

    // 🔥 live refresh every 10 seconds
    const interval = setInterval(loadSales, 10000)

    return () => clearInterval(interval)
  }, [])

  const handleExport = () => {
    window.open("http://localhost:5050/api/orders/export", "_blank")
  }

  return (
    <div style={{
      background: "#020617",
      padding: "20px",
      borderRadius: "12px",
      marginBottom: "20px",
      border: "1px solid #1e293b"
    }}>
      <h2 style={{ color: "white", marginBottom: "15px" }}>
        📊 Sales Dashboard
      </h2>

      {loading ? (
        <p style={{ color: "white" }}>Loading...</p>
      ) : (
        <div style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap"
        }}>

          {/* TOTAL REVENUE */}
          <div style={cardStyle("#22c55e")}>
            <h3>💰 Total Revenue</h3>
            <p>${data.totalRevenue.toFixed(2)}</p>
          </div>

          {/* TOTAL ORDERS */}
          <div style={cardStyle("#3b82f6")}>
            <h3>📦 Orders</h3>
            <p>{data.totalOrders}</p>
          </div>

          {/* TODAY */}
          <div style={cardStyle("#f59e0b")}>
            <h3>📅 Today</h3>
            <p>${(data.todayRevenue || 0).toFixed(2)}</p>
          </div>

          {/* EXPORT */}
          <div style={cardStyle("#a855f7")}>
            <h3>📄 Export</h3>
            <button onClick={handleExport} style={{
              padding: "6px 12px",
              background: "black",
              color: "white",
              border: "none",
              cursor: "pointer"
            }}>
              Download CSV
            </button>
          </div>

        </div>
      )}
    </div>
  )
}

/* ================= STYLE ================= */
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