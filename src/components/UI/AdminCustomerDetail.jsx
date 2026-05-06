import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../../services/api"

import AdminEmailPanel from "../../components/ui/AdminEmailPanel"

export default function AdminCustomerDetail() {

  const { id } = useParams()

  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const loadCustomer = async () => {

      try {

        const token = localStorage.getItem("adminToken")

        /* ================= CUSTOMER ================= */

        const customerRes = await api.get(
          `/customers/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const customerData =
          customerRes.data?.data ||
          customerRes.data

        setCustomer(customerData)

        /* ================= ORDERS ================= */

        const ordersRes = await api.get(
          `/orders/customer/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const orderData =
          ordersRes.data?.data || []

        setOrders(orderData)

      } catch (err) {

        console.error(
          "❌ CUSTOMER DETAIL ERROR:",
          err.response?.data || err.message
        )

      } finally {
        setLoading(false)
      }
    }

    loadCustomer()

  }, [id])

  if (loading) {
    return (
      <div style={loadingStyle}>
        <h2>Loading customer...</h2>
      </div>
    )
  }

  if (!customer) {
    return (
      <div style={loadingStyle}>
        <h2>Customer not found</h2>
      </div>
    )
  }

  return (
    <div style={page}>

      <div style={card}>

        <h1 style={title}>
          👤 Customer Detail
        </h1>

        <div style={infoGrid}>

          <div>
            <p style={label}>Name</p>
            <h3>
              {customer.name || "No name"}
            </h3>
          </div>

          <div>
            <p style={label}>Email</p>
            <h3>
              {customer.email || "No email"}
            </h3>
          </div>

          <div>
            <p style={label}>Role</p>
            <h3>
              {customer.role || "customer"}
            </h3>
          </div>

        </div>

      </div>

      {/* ================= EMAIL PANEL ================= */}

      <AdminEmailPanel customer={customer} />

      {/* ================= ORDERS ================= */}

      <div style={card}>

        <h2 style={{ marginBottom: 20 }}>
          📦 Customer Orders
        </h2>

        {orders.length === 0 ? (

          <p style={{ opacity: 0.7 }}>
            No orders found
          </p>

        ) : (

          <div style={ordersGrid}>

            {orders.map(order => (

              <div
                key={order._id}
                style={orderCard}
              >

                <p>
                  <strong>Order ID:</strong>
                </p>

                <p style={orderId}>
                  {order._id}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {order.status}
                </p>

                <p>
                  <strong>Total:</strong>{" "}
                  $
                  {Number(
                    order.finalPrice || 0
                  ).toFixed(2)}
                </p>

                <p>
                  <strong>Items:</strong>{" "}
                  {order.items?.length || 0}
                </p>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  )
}

/* ================= STYLES ================= */

const page = {
  padding: 30,
  color: "#fff",
  background: "#020617",
  minHeight: "100vh"
}

const loadingStyle = {
  padding: 40,
  color: "#fff"
}

const card = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 16,
  padding: 24,
  marginBottom: 30
}

const title = {
  marginBottom: 24
}

const infoGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 20
}

const label = {
  opacity: 0.7,
  marginBottom: 4
}

const ordersGrid = {
  display: "grid",
  gap: 16
}

const orderCard = {
  padding: 18,
  borderRadius: 12,
  background: "#111827",
  border: "1px solid #1f2937"
}

const orderId = {
  fontSize: 12,
  opacity: 0.7,
  wordBreak: "break-all"
}