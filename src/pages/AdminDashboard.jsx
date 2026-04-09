import { useEffect, useState, useCallback, useRef } from "react"
import { io } from "socket.io-client"
import api from "../services/api"

const API_URL = import.meta.env.VITE_API_URL || "https://signavi-backend.onrender.com/api"
const SOCKET_URL = API_URL.replace("/api", "")

function AdminDashboard() {

  const [data, setData] = useState(null)
  const loadingRef = useRef(false)

  /* ================= LOAD ================= */
  const load = useCallback(async () => {
    // 🔥 prevent overlapping calls
    if (loadingRef.current) return

    try {
      loadingRef.current = true

      const res = await api.get("/analytics")
      setData(res.data)

    } catch (err) {
      console.error("❌ DASHBOARD ERROR:", err)
    } finally {
      loadingRef.current = false
    }
  }, [])

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    const init = async () => {
      await load()
    }
    init()
  }, [load])

  /* ================= SOCKET ================= */
  useEffect(() => {

    const socket = io(SOCKET_URL)

    const handleUpdate = () => {
      console.log("📡 Dashboard update received")
      load()
    }

    socket.on("jobUpdated", handleUpdate)
    socket.on("pricingUpdated", handleUpdate)

    return () => {
      socket.off("jobUpdated", handleUpdate)
      socket.off("pricingUpdated", handleUpdate)
      socket.disconnect()
    }

  }, [load])

  if (!data) {
    return (
      <p style={{ color: "white", padding: 20 }}>
        Loading dashboard...
      </p>
    )
  }

  return (
    <div style={{ padding: 20, color: "white" }}>

      <h1>📊 Dashboard</h1>

      <div style={card}>
        <h2>Revenue</h2>
        <p>${Number(data.totalRevenue || 0).toFixed(2)}</p>
      </div>

      <div style={card}>
        <h2>Profit</h2>
        <p>${Number(data.totalProfit || 0).toFixed(2)}</p>
      </div>

    </div>
  )
}

const card = {
  background: "#1e293b",
  padding: 15,
  marginTop: 10,
  borderRadius: 10
}

export default AdminDashboard