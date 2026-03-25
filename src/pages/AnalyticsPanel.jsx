import { useEffect, useState } from "react"
import api from "../services/api"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts"

function AnalyticsPanel() {
  const [data, setData] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/analytics")
        setData(res.data)
      } catch (err) {
        console.error("Analytics error:", err)
      }
    }

    load()
  }, [])

  if (!data) return <p style={{ color: "white" }}>Loading analytics...</p>

  return (
    <div style={container}>
      <h2>📊 Analytics Dashboard</h2>

      {/* SUMMARY */}
      <div style={grid}>
        <Card title="Revenue" value={format(data.totalRevenue)} />
        <Card title="Profit" value={format(data.totalProfit)} />
        <Card title="Fees" value={format(data.totalFees)} />
        <Card title="COGS" value={format(data.totalCOGS)} />
      </div>

      {/* MONTHLY */}
      <h3 style={section}>📈 Monthly Performance</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data.monthly || []}>
          <CartesianGrid stroke="#334155" />
          <XAxis dataKey="month" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Line dataKey="revenue" stroke="#06b6d4" />
          <Line dataKey="profit" stroke="#22c55e" />
        </LineChart>
      </ResponsiveContainer>

      {/* PRODUCTS */}
      <h3 style={section}>📊 Product Performance</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data.products || []}>
          <CartesianGrid stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Bar dataKey="revenue" fill="#06b6d4" />
          <Bar dataKey="profit" fill="#22c55e" />
        </BarChart>
      </ResponsiveContainer>

      {/* INSIGHTS */}
      <h3 style={section}>🤖 Insights</h3>
      <div style={insightBox}>
        {data.insights?.map((i, idx) => (
          <p key={idx}>• {i}</p>
        ))}
      </div>
    </div>
  )
}

/* ================= HELPERS ================= */

const format = (v) => `$${Number(v || 0).toFixed(2)}`

function Card({ title, value }) {
  return (
    <div style={card}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  )
}

/* ================= STYLES ================= */

const container = {
  padding: 20,
  color: "white",
  background: "#020617",
  minHeight: "100vh"
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 10,
  marginBottom: 20
}

const card = {
  background: "#020617",
  padding: 12,
  borderRadius: 10,
  border: "1px solid rgba(148,163,184,0.2)"
}

const section = {
  marginTop: 20,
  marginBottom: 10
}

const insightBox = {
  background: "#0f172a",
  padding: 12,
  borderRadius: 10
}

export default AnalyticsPanel