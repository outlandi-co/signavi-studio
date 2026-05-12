import { useEffect, useState } from "react"
import api from "../../services/api"

export default function AdminRevenue() {

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const loadOrders = async () => {

      try {

        console.log("🔥 ADMIN REVENUE LOADING")

        const res = await api.get("/orders")

        console.log("🔥 RESPONSE:", res.data)

        const safeOrders = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : []

        setOrders(safeOrders)

      } catch (err) {

        console.error(
          "❌ ADMIN REVENUE ERROR:",
          err
        )

      } finally {

        setLoading(false)
      }
    }

    loadOrders()

  }, [])

  const totalRevenue = orders.reduce(
    (sum, order) =>
      sum + Number(order?.finalPrice || 0),
    0
  )

  const downloadOrdersCSV = () => {

    window.open(
      "https://signavi-backend.onrender.com/api/orders/export",
      "_blank"
    )
  }

  const downloadTaxCSV = () => {

    window.open(
      "https://signavi-backend.onrender.com/api/export-taxes",
      "_blank"
    )
  }

  if (loading) {

    return (
      <div style={center}>
        <h1 style={{ color: "white" }}>
          ⏳ Loading Revenue Dashboard...
        </h1>
      </div>
    )
  }

  return (

    <div style={container}>

      {/* ================= TEST ================= */}

      <div style={testBanner}>
        ✅ ADMIN REVENUE PAGE LOADED
      </div>

      {/* ================= TITLE ================= */}

      <h1 style={title}>
        💰 Revenue Dashboard
      </h1>

      {/* ================= BUTTONS ================= */}

      <div style={toolbar}>

        <button
          onClick={downloadOrdersCSV}
          style={csvButton}
        >
          📄 Download Orders CSV
        </button>

        <button
          onClick={downloadTaxCSV}
          style={taxButton}
        >
          🧾 Download Tax CSV
        </button>

      </div>

      {/* ================= SUMMARY ================= */}

      <div style={summaryGrid}>

        <div style={card}>
          <p>Total Orders</p>

          <h2>
            {orders.length}
          </h2>
        </div>

        <div style={card}>
          <p>Total Revenue</p>

          <h2>
            ${totalRevenue.toFixed(2)}
          </h2>
        </div>

      </div>

      {/* ================= TABLE ================= */}

      <div style={tableWrap}>

        <table style={table}>

          <thead>

            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
            </tr>

          </thead>

          <tbody>

            {orders.map(order => (

              <tr key={order._id}>

                <td>
                  #{order._id?.slice(-6)}
                </td>

                <td>
                  {order.customerName || "Unknown"}
                </td>

                <td>
                  {order.status}
                </td>

                <td>
                  $
                  {Number(
                    order.finalPrice || 0
                  ).toFixed(2)}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}

/* ================= STYLES ================= */

const container = {

  background: "#020617",

  minHeight: "100vh",

  color: "white",

  padding: 20
}

const center = {

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  minHeight: "100vh",

  background: "#020617"
}

const testBanner = {

  background: "#22c55e",

  color: "#020617",

  padding: 16,

  borderRadius: 10,

  fontWeight: "bold",

  marginBottom: 20,

  fontSize: 18
}

const title = {

  marginBottom: 20
}

const toolbar = {

  display: "flex",

  gap: 12,

  marginBottom: 24,

  flexWrap: "wrap"
}

const csvButton = {

  background: "#22c55e",

  color: "#020617",

  border: "none",

  padding: "12px 16px",

  borderRadius: 10,

  fontWeight: "bold",

  cursor: "pointer"
}

const taxButton = {

  background: "#38bdf8",

  color: "#020617",

  border: "none",

  padding: "12px 16px",

  borderRadius: 10,

  fontWeight: "bold",

  cursor: "pointer"
}

const summaryGrid = {

  display: "flex",

  gap: 20,

  marginBottom: 24,

  flexWrap: "wrap"
}

const card = {

  background: "#0f172a",

  border: "1px solid #1e293b",

  borderRadius: 12,

  padding: 20,

  minWidth: 220
}

const tableWrap = {

  overflowX: "auto"
}

const table = {

  width: "100%",

  borderCollapse: "collapse",

  background: "#0f172a"
}