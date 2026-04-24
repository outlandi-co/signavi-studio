import { useState } from "react"
import api from "../../services/api"

export default function AdminShipping() {

  const [orderId, setOrderId] = useState("")
  const [order, setOrder] = useState(null)

  const [trackingNumber, setTrackingNumber] = useState("")
  const [trackingLink, setTrackingLink] = useState("")
  const [carrier, setCarrier] = useState("USPS")

  const [loading, setLoading] = useState(false)

  /* ================= LOAD ORDER ================= */
  const loadOrder = async () => {
    if (!orderId) return

    try {
      setLoading(true)
      const res = await api.get(`/orders/${orderId}`)
      setOrder(res.data)

      setTrackingNumber(res.data.trackingNumber || "")
      setTrackingLink(res.data.trackingLink || "")
      setCarrier(res.data.carrier || "USPS")

    } catch (err) {
      console.error(err)
      alert("Order not found")
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  /* ================= UPDATE SHIPPING ================= */
  const updateShipping = async () => {
    if (!orderId) return

    try {
      setLoading(true)

      await api.patch(`/orders/update-shipping/${orderId}`, {
        trackingNumber,
        trackingLink,
        carrier
      })

      alert("✅ Shipping updated")

      await loadOrder()

    } catch (err) {
      console.error(err)
      alert("Error updating shipping")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      padding: 40,
      color: "white",
      maxWidth: 600,
      margin: "0 auto"
    }}>

      <h1>🚚 Admin Shipping Panel</h1>

      {/* SEARCH */}
      <div style={{ marginTop: 20 }}>
        <input
          placeholder="Enter Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <button onClick={loadOrder}>
          Load Order
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {/* ORDER DETAILS */}
      {order && (
        <div style={{ marginTop: 30 }}>

          <h2>Status: {order.status}</h2>

          {/* ITEMS */}
          <div style={{ marginBottom: 20 }}>
            {order.items?.map((item, i) => (
              <div key={i}>
                {item.name} ({item.variant?.size}) x {item.quantity}
              </div>
            ))}
          </div>

          {/* SHIPPING FORM */}
          <div style={{
            background: "#111",
            padding: 20,
            borderRadius: 8
          }}>

            <h3>Shipping Info</h3>

            <input
              placeholder="Carrier (USPS, UPS, FedEx)"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              style={{ width: "100%", marginBottom: 10, padding: 8 }}
            />

            <input
              placeholder="Tracking Number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              style={{ width: "100%", marginBottom: 10, padding: 8 }}
            />

            <input
              placeholder="Tracking Link"
              value={trackingLink}
              onChange={(e) => setTrackingLink(e.target.value)}
              style={{ width: "100%", marginBottom: 10, padding: 8 }}
            />

            <button onClick={updateShipping}>
              🚀 Mark as Shipped
            </button>

          </div>
        </div>
      )}
    </div>
  )
}