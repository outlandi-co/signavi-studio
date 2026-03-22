import { useEffect, useState } from "react"
import api from "../services/api"

function AdminDashboard() {

  const [data, setData] = useState(null)

  useEffect(() => {
    const load = async () => {
      const res = await api.get("/analytics")
      setData(res.data)
    }

    load()
  }, [])

  if (!data) return <p>Loading...</p>

  return (
    <div style={{ padding: "20px", color: "white" }}>

      <h1>📊 Dashboard</h1>

      <div style={card}>
        <h2>Total Orders</h2>
        <p>{data.totalOrders}</p>
      </div>

      <div style={card}>
        <h2>Total Quotes</h2>
        <p>{data.totalQuotes}</p>
      </div>

      <div style={card}>
        <h2>Revenue</h2>
        <p>${data.revenue}</p>
      </div>

      <div style={card}>
        <h2>Status Breakdown</h2>
        {data.statusBreakdown.map(s => (
          <p key={s._id}>
            {s._id}: {s.count}
          </p>
        ))}
      </div>

    </div>
  )
}

const card = {
  background: "#1e293b",
  padding: "15px",
  marginTop: "10px",
  borderRadius: "10px"
}

export default AdminDashboard