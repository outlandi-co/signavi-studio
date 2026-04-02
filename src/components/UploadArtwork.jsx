import { useEffect, useState } from "react"
import api from "../services/api"

function UploadArtwork() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await api.get("/orders")
        setOrders(res.data)
      } catch (err) {
        console.error("❌ LOAD ORDERS ERROR:", err)
      }
    }

    loadOrders()
  }, [])

  const handleUpload = async () => {
    if (!selectedOrder) return alert("Select order")
    if (!file) return alert("Upload file")

    const formData = new FormData()
    formData.append("artwork", file)

    try {
      setLoading(true)

      await api.patch(`/orders/${selectedOrder._id}/artwork`, formData)

      alert("✅ Attached to order")

      setFile(null)
      setSelectedOrder(null)

    } catch (err) {
      console.error("❌ UPLOAD ERROR:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>🎨 Mockup Generator</h2>

      <select
        value={selectedOrder?._id || ""}
        onChange={(e) => {
          const order = orders.find(o => o._id === e.target.value)
          setSelectedOrder(order || null)
        }}
      >
        <option value="">Select Order</option>
        {orders.map(o => (
          <option key={o._id} value={o._id}>
            {o.customerName}
          </option>
        ))}
      </select>

      {!selectedOrder && <p>⚠ No order selected</p>}
      {selectedOrder && <p>✅ {selectedOrder.customerName}</p>}

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <button onClick={handleUpload}>
        {loading ? "Uploading..." : "Save Mockup"}
      </button>
    </div>
  )
}

export default UploadArtwork