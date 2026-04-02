import { useEffect, useState, useRef } from "react"
import api from "../services/api"

function ShippingDashboard() {
  const mountedRef = useRef(true)

  const [data, setData] = useState({
    totalShippingRevenue: 0,
    totalShippingOrders: 0,
    orders: []
  })

  const [loading, setLoading] = useState(true)

  const loadShipping = async () => {
    try {
      const res = await api.get("/orders/shipping")

      if (!mountedRef.current) return

      setData(res.data)

    } catch (err) {
      console.error("❌ SHIPPING LOAD ERROR:", err)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    mountedRef.current = true

    loadShipping()

    const interval = setInterval(loadShipping, 10000)

    return () => {
      mountedRef.current = false
      clearInterval(interval)
    }
  }, [])

  return (
    <div style={containerStyle}>
      <h2 style={{ color: "white" }}>🚚 Shipping Dashboard</h2>

      {loading ? (
        <p style={{ color: "white" }}>Loading...</p>
      ) : (
        <>
          <div style={gridStyle}>
            <Card title="🚚 Shipping Orders" value={data.totalShippingOrders} color="#f97316" />
            <Card title="💰 Shipping Revenue" value={`$${data.totalShippingRevenue}`} color="#22c55e" />
          </div>

          <div style={{ marginTop: "20px" }}>
            {data.orders.map(order => (
              <div key={order._id} style={orderCard}>
                <p><strong>{order.customerName}</strong></p>
                <p>Status: {order.status}</p>

                {order.trackingLink && (
                  <a
                    href={order.trackingLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#22c55e" }}
                  >
                    📦 Track Package
                  </a>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const Card = ({ title, value, color }) => (
  <div style={{
    flex: 1,
    padding: "12px",
    border: `1px solid ${color}`,
    borderRadius: "10px",
    color: "white"
  }}>
    <h3>{title}</h3>
    <p>{value}</p>
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
  gap: "20px"
}

const orderCard = {
  background: "#020617",
  padding: "10px",
  border: "1px solid #334155",
  borderRadius: "10px",
  marginBottom: "10px",
  color: "white"
}

export default ShippingDashboard