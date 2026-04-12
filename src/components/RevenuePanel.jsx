import { useEffect, useState } from "react"
import api from "../services/api"

function RevenuePanel() {
  const [data, setData] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/analytics")

        // ✅ SAFE
        const safeData = res.data?.data || res.data || {}

        setData(safeData)

      } catch (err) {
        console.error("❌ ANALYTICS ERROR:", err)
        setData({})
      }
    }

    load()
  }, [])

  if (!data) return null

  return (
    <div style={{ background: "#020617", padding: 20, color: "white" }}>
      <h2>💰 Revenue</h2>

      <p>Total: ${data.totalRevenue || 0}</p>
      <p>Recovered: ${data.recoveredRevenue || 0}</p>
    </div>
  )
}

export default RevenuePanel