import { useEffect, useState } from "react"
import api from "../../services/api"

export default function AdminProfit() {
  const [data, setData] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/orders/profit-summary")
        setData(res.data.data)
      } catch (err) {
        console.error("❌ LOAD PROFIT:", err)
      }
    }

    load()
  }, [])

  if (!data) return <p style={{ padding: 20 }}>Loading...</p>

  return (
    <div style={container}>
      <h1>💰 Profit Dashboard</h1>

      <div style={grid}>
        <Card title="Revenue" value={`$${data.revenue.toFixed(2)}`} />
        <Card title="Profit" value={`$${data.profit.toFixed(2)}`} />
        <Card title="Orders" value={data.count} />
        <Card title="Avg Margin" value={`${data.avgMargin.toFixed(1)}%`} />
      </div>
    </div>
  )
}

function Card({ title, value }) {
  return (
    <div style={card}>
      <p style={{ opacity: 0.6 }}>{title}</p>
      <h2>{value}</h2>
    </div>
  )
}

const container = {
  padding: 20,
  color: "white"
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 20,
  marginTop: 20
}

const card = {
  background: "#1e293b",
  padding: 20,
  borderRadius: 10
}