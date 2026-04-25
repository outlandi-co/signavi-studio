import { useState, useEffect } from "react"
import api from "../../services/api"

export default function ShippingEditor({ order, onUpdate }) {
  const [shippingCost, setShippingCost] = useState(0)
  const [carrier, setCarrier] = useState("USPS")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [serviceLevel, setServiceLevel] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!order) return

    setShippingCost(order.shippingCost || 0)
    setCarrier(order.carrier || "USPS")
    setTrackingNumber(order.trackingNumber || "")
    setServiceLevel(order.serviceLevel || "")
  }, [order])

  const handleSave = async () => {
    try {
      setLoading(true)

      const res = await api.patch(`/orders/${order._id}/shipping`, {
        shippingCost,
        carrier,
        trackingNumber,
        serviceLevel
      })

      alert("✅ Shipping updated")

      if (onUpdate) {
        onUpdate(res.data.data)
      }

    } catch (err) {
      console.error(err)
      alert("❌ Failed to update shipping")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      marginTop: 30,
      padding: 20,
      background: "#0f172a",
      borderRadius: 10,
      color: "white"
    }}>
      <h3>🚚 Shipping Editor</h3>

      <input
        type="number"
        placeholder="Shipping Cost"
        value={shippingCost}
        onChange={(e) => setShippingCost(Number(e.target.value))}
        style={input}
      />

      <select
        value={carrier}
        onChange={(e) => setCarrier(e.target.value)}
        style={input}
      >
        <option>USPS</option>
        <option>UPS</option>
        <option>FedEx</option>
      </select>

      <input
        placeholder="Service Level"
        value={serviceLevel}
        onChange={(e) => setServiceLevel(e.target.value)}
        style={input}
      />

      <input
        placeholder="Tracking Number"
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
        style={input}
      />

      <button onClick={handleSave} style={btn}>
        {loading ? "Saving..." : "Save Shipping"}
      </button>
    </div>
  )
}

const input = {
  display: "block",
  marginBottom: 10,
  padding: 10,
  width: "100%",
  borderRadius: 6
}

const btn = {
  padding: 10,
  background: "#22c55e",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  color: "black"
}