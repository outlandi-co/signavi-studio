import { useEffect, useState } from "react"
import api from "../../services/api"

function Orders() {

  const [orders, setOrders] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/orders")
        setOrders(res.data)
      } catch (err) {
        console.error(err)
      }
    }

    load()
  }, [])

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
            <th>Status</th>
            <th>Qty</th>
          </tr>
        </thead>

        <tbody>
          {orders.map(o => (
            <tr key={o._id} style={{ borderBottom: "1px solid #1e293b" }}>
              <td>{o._id.slice(-6)}</td>
              <td>{o.customerName}</td>
              <td>{o.status}</td>
              <td>{o.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Orders