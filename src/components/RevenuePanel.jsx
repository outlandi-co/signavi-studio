import { useEffect, useState } from "react"
import api from "../services/api"

function RevenuePanel() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get("/analytics").then(res => setData(res.data))
  }, [])

  if (!data) return null

  return (
    <div style={{ background: "#020617", padding: 20, color: "white" }}>
      <h2>💰 Revenue</h2>

      <p>Total: ${data.totalRevenue}</p>
      <p>Recovered: ${data.recoveredRevenue}</p>
    </div>
  )
}

export default RevenuePanel