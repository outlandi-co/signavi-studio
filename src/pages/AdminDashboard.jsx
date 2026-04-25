import { useEffect, useState, useCallback, useRef } from "react"
import api from "../services/api"
import { getSocket } from "../services/socket"

function AdminDashboard() {

  const [data, setData] = useState(null)
  const [rates, setRates] = useState([])
  const loadingRef = useRef(false)

  /* ================= LOAD ================= */
  const load = useCallback(async () => {
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

  useEffect(() => {
    load()
  }, [load])

  /* ================= SOCKET ================= */
  useEffect(() => {
    let socket

    const init = async () => {
      socket = await getSocket()
      if (!socket) return

      const handleUpdate = () => {
        console.log("📡 Dashboard update received")
        load()
      }

      socket.on("jobUpdated", handleUpdate)
      socket.on("pricingUpdated", handleUpdate)
    }

    init()

    return () => {
      socket?.off("jobUpdated")
      socket?.off("pricingUpdated")
    }
  }, [load])

  /* ================= GET SHIPPING RATES ================= */
  const getRates = async () => {
    try {
      console.log("📦 Getting shipping rates...")

      const res = await api.post("/shipping/get-rates", {
        address_to: {
          name: "Adam",
          street1: "456 Test St",
          city: "Merced",
          state: "CA",
          zip: "95340",
          country: "US"
        }
      })

      console.log("🚚 RATES:", res.data)
      setRates(res.data.rates || [])

    } catch (err) {
      console.error("❌ RATE ERROR:", err.response?.data || err.message)
    }
  }

  /* ================= TEST SHIPPING ================= */
  const testShipping = async () => {
    try {
      console.log("🚚 Creating shipment...")

      const res = await api.post("/shipping/create-shipment", {
        address_to: {
          name: "Adam",
          street1: "456 Test St",
          city: "Merced",
          state: "CA",
          zip: "95340",
          country: "US"
        }
      })

      console.log("📦 SHIPPING SUCCESS:", res.data)
      alert("Shipment created! Check console.")

    } catch (err) {
      console.error("❌ SHIPPING ERROR:", err.response?.data || err.message)
      alert("Shipping failed.")
    }
  }

  if (!data) {
    return <p style={{ color: "white", padding: 20 }}>Loading dashboard...</p>
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

      {/* 🚚 SHIPPING TEST */}
      <div style={card}>
        <h2>Shipping Test</h2>

        <button onClick={getRates} style={button}>
          📦 Get Shipping Rates
        </button>

        <button onClick={testShipping} style={{ ...button, marginLeft: 10 }}>
          🚚 Create Shipment
        </button>

        {/* SHOW RATES */}
        {rates.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {rates.map((rate) => (
              <div key={rate.object_id} style={{ fontSize: 12 }}>
                {rate.provider} - {rate.servicelevel?.name} - ${rate.amount}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ================= STYLES ================= */
const card = {
  background: "#1e293b",
  padding: 15,
  marginTop: 10,
  borderRadius: 10
}

const button = {
  padding: "10px 15px",
  background: "#06b6d4",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold"
}

export default AdminDashboard