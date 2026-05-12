import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/orders")
        const data = Array.isArray(res.data?.data) ? res.data.data : []
        setOrders(data)
      } catch (err) {
        console.error("❌ ORDERS LOAD ERROR:", err)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <p style={{ padding: 20 }}>Loading orders...</p>
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>📦 Orders</h1>

      <table style={{
        width: "100%",
        marginTop: 20,
        borderCollapse: "collapse"
      }}>
        <thead>
          <tr style={{ background: "#020617" }}>
            <th>ID</th>
            <th>Customer</th>
            <th>Email</th>
            <th>Status</th>
            <th>Total</th>
            <th>Qty</th>
          </tr>
        </thead>

        <tbody>
          {orders.map(order => (
            <tr
              key={order._id}
              onClick={() => navigate(`/admin/orders/${order._id}`)}
              style={{
                borderBottom: "1px solid #1e293b",
                cursor: "pointer"
              }}
            >
              <td>#{order._id.slice(-6)}</td>
              <td>{order.customerName || "Customer"}</td>
              <td>{order.email || "No email"}</td>
              <td>{order.status}</td>
              <td>${Number(order.finalPrice || 0).toFixed(2)}</td>
              <td>{order.quantity || order.items?.length || 1}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Orders