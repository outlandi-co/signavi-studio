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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/analytics")

        const safeData = {
          totalRevenue: res.data?.totalRevenue || 0,
          totalProfit: res.data?.totalProfit || 0,
          totalFees: res.data?.totalFees || 0,
          totalCOGS: res.data?.totalCOGS || 0,
          monthly: res.data?.monthly || [],
          insights: res.data?.insights || [],
          products: res.data?.products || []
        }

        setData(safeData)
      } catch (err) {
        console.error("Analytics error:", err)
        setError("Failed to load analytics")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) return <p style={{ color: "white" }}>Loading dashboard...</p>
  if (error) return <p style={{ color: "red" }}>{error}</p>
  if (!data) return <p style={{ color: "white" }}>No data available</p>

  return (
    <div style={panelContainer}>

      <h2 style={title}>📊 Analytics</h2>

      {/* SUMMARY */}
      <div style={grid}>
        <Card title="Revenue" value={formatMoney(data.totalRevenue)} />
        <Card title="Profit" value={formatMoney(data.totalProfit)} />
        <Card title="Fees" value={formatMoney(data.totalFees)} />
        <Card title="COGS" value={formatMoney(data.totalCOGS)} />
      </div>

      {/* MONTHLY */}
      <h3 style={sectionTitle}>📈 Monthly</h3>

      {data.monthly.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>No data</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.monthly}>
            <CartesianGrid stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#06b6d4" />
            <Line type="monotone" dataKey="profit" stroke="#22c55e" />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* PRODUCT CHART */}
      <h3 style={sectionTitle}>📊 Products</h3>

      {data.products.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>No products</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.products}>
            <CartesianGrid stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="revenue" fill="#06b6d4" />
            <Bar dataKey="profit" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* PRODUCT CARDS */}
      <h3 style={sectionTitle}>🛍 Products</h3>

      <div style={grid}>
        {data.products.map((p, i) => (
          <div key={i} style={productCard}>
            <h4 style={{ color: "#06b6d4" }}>{p.name}</h4>
            <p>💰 {formatMoney(p.revenue)}</p>
            <p>📈 {formatMoney(p.profit)}</p>
            <p>📦 {p.quantity}</p>
          </div>
        ))}
      </div>

      {/* INSIGHTS */}
      <h3 style={sectionTitle}>🤖 Insights</h3>

      <div style={insightBox}>
        {data.insights.map((insight, i) => (
          <p key={i}>• {insight}</p>
        ))}
      </div>

    </div>
  )
}

/* ================= HELPERS ================= */

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

/* ================= COMPONENTS ================= */

function Card({ title, value }) {
  return (
    <div style={card}>
      <p style={cardTitle}>{title}</p>
      <h2>{value}</h2>
    </div>
  )
}

/* ================= STYLES ================= */

/* 🔥 THIS FIXES YOUR SCROLL ISSUE */
const panelContainer = {
  height: "100vh",            // full height
  overflowY: "auto",          // enables scroll
  padding: "12px",
  color: "white",
  background: "#020617"
}

const title = {
  marginBottom: "10px"
}

const sectionTitle = {
  marginTop: "20px",
  marginBottom: "10px"
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "10px"
}

const card = {
  background: "#020617",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid rgba(148,163,184,0.2)"
}

const productCard = {
  background: "#020617",
  padding: "14px",
  borderRadius: "10px",
  border: "2px solid #06b6d4",
  boxShadow: "0 0 10px rgba(6,182,212,0.3)"
}

const cardTitle = {
  fontSize: "12px",
  opacity: 0.7
}

const insightBox = {
  background: "#0f172a",
  padding: "12px",
  borderRadius: "10px"
}

export default AnalyticsPanel