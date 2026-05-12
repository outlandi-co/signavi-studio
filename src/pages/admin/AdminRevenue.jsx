import { useEffect, useState } from "react"
import api from "../../services/api"

export default function AdminRevenue() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/orders")

        const safeOrders = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : []

        setOrders(safeOrders)
      } catch (err) {
        console.error("❌ REVENUE LOAD ERROR:", err)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  /* ================= EXPORTS ================= */

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

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div style={center}>
        <h2 style={{ color: "white" }}>⏳ Loading revenue...</h2>
      </div>
    )
  }

  const safeOrders = Array.isArray(orders) ? orders : []

  /* ================= CALCULATIONS ================= */

  const totalRevenue = safeOrders.reduce(
    (sum, order) =>
      sum + Number(order?.finalPrice || order?.price || 0),
    0
  )

  const totalOrders = safeOrders.length

  const paidOrders = safeOrders.filter(
    order =>
      order.status === "paid" ||
      order.status === "shipping" ||
      order.status === "shipped" ||
      order.status === "delivered"
  )

  const paidRevenue = paidOrders.reduce(
    (sum, order) =>
      sum + Number(order?.finalPrice || order?.price || 0),
    0
  )

  const lowProfit = safeOrders.filter(
    order => Number(order?.profit || 0) < 5
  )

  const topJobs = [...safeOrders]
    .sort(
      (a, b) =>
        Number(b?.profit || 0) - Number(a?.profit || 0)
    )
    .slice(0, 5)

  /* ================= UI ================= */

  return (
    <div style={container}>
      <h1 style={title}>💰 Revenue Dashboard</h1>

      {/* EXPORT BUTTONS */}
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

      {/* SUMMARY */}
      <div style={summary}>
        <div style={card}>
          <p>Total Revenue</p>
          <strong>${totalRevenue.toFixed(2)}</strong>
        </div>

        <div style={card}>
          <p>Paid Revenue</p>
          <strong>${paidRevenue.toFixed(2)}</strong>
        </div>

        <div style={card}>
          <p>Total Orders</p>
          <strong>{totalOrders}</strong>
        </div>
      </div>

      {/* ALERTS */}
      <div style={card}>
        <h2>🚨 Alerts</h2>

        <p style={{ color: "#f87171" }}>
          {lowProfit.length} low-profit job(s)
        </p>
      </div>

      {/* TOP JOBS */}
      <div style={card}>
        <h2>🏆 Top Profit Jobs</h2>

        {topJobs.length === 0 ? (
          <p>No jobs yet</p>
        ) : (
          topJobs.map((job, index) => (
            <div key={job._id} style={row}>
              <p>
                {index + 1}.{" "}
                {job.customerName || "Unknown"}
              </p>

              <p style={{ color: "#22c55e" }}>
                ${Number(job?.profit || 0).toFixed(2)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/* ================= STYLES ================= */

const container = {
  padding: 20,
  background: "#020617",
  minHeight: "100vh",
  color: "white"
}

const title = {
  marginBottom: 20
}

const toolbar = {
  display: "flex",
  gap: 12,
  marginBottom: 20,
  flexWrap: "wrap"
}

const csvButton = {
  background: "#22c55e",
  color: "#020617",
  border: "none",
  padding: "10px 14px",
  borderRadius: 8,
  fontWeight: "bold",
  cursor: "pointer"
}

const taxButton = {
  background: "#38bdf8",
  color: "#020617",
  border: "none",
  padding: "10px 14px",
  borderRadius: 8,
  fontWeight: "bold",
  cursor: "pointer"
}

const summary = {
  display: "flex",
  gap: 20,
  marginBottom: 20,
  flexWrap: "wrap"
}

const card = {
  background: "#1e293b",
  padding: 15,
  borderRadius: 8,
  marginBottom: 20,
  minWidth: 180
}

const row = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  borderBottom: "1px solid #334155"
}

const center = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "#020617"
}