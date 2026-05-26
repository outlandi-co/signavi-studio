import { useCallback, useEffect, useRef, useState } from "react"
import api from "../services/api"

function ShippingDashboard() {
  const mountedRef = useRef(false)

  const [data, setData] = useState({
    totalShippingRevenue: 0,
    totalShippingOrders: 0,
    orders: [],
  })

  const [loading, setLoading] = useState(true)

  const loadShipping = useCallback(async () => {
    try {
      const res = await api.get("/orders/shipping")

      if (!mountedRef.current) return

      setData({
        totalShippingRevenue: res.data?.totalShippingRevenue || 0,
        totalShippingOrders: res.data?.totalShippingOrders || 0,
        orders: Array.isArray(res.data?.orders) ? res.data.orders : [],
      })
    } catch (err) {
      console.error("❌ SHIPPING LOAD ERROR:", err)
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true

    const timeout = setTimeout(() => {
      loadShipping()
    }, 0)

    const interval = setInterval(() => {
      loadShipping()
    }, 10000)

    return () => {
      mountedRef.current = false
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [loadShipping])

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>🚚 Shipping Dashboard</h2>

      {loading ? (
        <p style={textStyle}>Loading...</p>
      ) : (
        <>
          <div style={gridStyle}>
            <Card
              title="🚚 Shipping Orders"
              value={data.totalShippingOrders}
              color="#f97316"
            />

            <Card
              title="💰 Shipping Revenue"
              value={`$${Number(data.totalShippingRevenue).toFixed(2)}`}
              color="#22c55e"
            />
          </div>

          <div style={ordersWrapperStyle}>
            {data.orders.length === 0 ? (
              <p style={textStyle}>No shipped orders yet.</p>
            ) : (
              data.orders.map((order) => (
                <div key={order._id} style={orderCardStyle}>
                  <p>
                    <strong>{order.customerName || "Unknown Customer"}</strong>
                  </p>

                  <p>Status: {order.status || "N/A"}</p>

                  {order.trackingNumber && (
                    <p>Tracking: {order.trackingNumber}</p>
                  )}

                  {order.trackingLink && (
                    <a
                      href={order.trackingLink}
                      target="_blank"
                      rel="noreferrer"
                      style={trackLinkStyle}
                    >
                      📦 Track Package
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Card({ title, value, color }) {
  return (
    <div
      style={{
        ...cardStyle,
        border: `1px solid ${color}`,
      }}
    >
      <h3 style={cardTitleStyle}>{title}</h3>
      <p style={cardValueStyle}>{value}</p>
    </div>
  )
}

const containerStyle = {
  background: "#020617",
  padding: "20px",
  borderRadius: "12px",
  marginBottom: "20px",
  border: "1px solid #1e293b",
}

const headingStyle = {
  color: "#fff",
  marginBottom: "16px",
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "20px",
}

const cardStyle = {
  padding: "14px",
  borderRadius: "10px",
  color: "#fff",
  background: "#0f172a",
}

const cardTitleStyle = {
  margin: 0,
  fontSize: "15px",
}

const cardValueStyle = {
  margin: "8px 0 0",
  fontSize: "22px",
  fontWeight: "700",
}

const ordersWrapperStyle = {
  marginTop: "20px",
}

const orderCardStyle = {
  background: "#020617",
  padding: "12px",
  border: "1px solid #334155",
  borderRadius: "10px",
  marginBottom: "10px",
  color: "#fff",
}

const textStyle = {
  color: "#fff",
}

const trackLinkStyle = {
  color: "#22c55e",
  fontWeight: "700",
  textDecoration: "none",
}

export default ShippingDashboard