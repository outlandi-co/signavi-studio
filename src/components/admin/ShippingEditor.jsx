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

      if (onUpdate) onUpdate(res.data.data)

    } catch (err) {
      console.error(err)
      alert("❌ Failed to update shipping")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h3>🚚 Shipping</h3>

      <input
        type="number"
        placeholder="Shipping Cost"
        value={shippingCost}
        onChange={(e) => setShippingCost(e.target.value)}
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
  width: "100%"
}

const btn = {
  padding: 10,
  background: "#22c55e",
  border: "none",
  cursor: "pointer"
}