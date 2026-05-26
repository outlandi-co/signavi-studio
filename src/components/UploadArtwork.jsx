import { useEffect, useState } from "react"
import api from "../services/api"

function UploadArtwork() {
  const [orders, setOrders] = useState([])
  const [selectedOrderId, setSelectedOrderId] = useState("")
  const [file, setFile] = useState(null)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await api.get("/orders")

        setOrders(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error("❌ LOAD ORDERS ERROR:", err)
        setOrders([])
      } finally {
        setLoadingOrders(false)
      }
    }

    const timeout = setTimeout(() => {
      loadOrders()
    }, 0)

    return () => clearTimeout(timeout)
  }, [])

  const selectedOrder = orders.find((order) => order._id === selectedOrderId)

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      setFile(null)
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!selectedOrder) {
      alert("Select an order first")
      return
    }

    if (!file) {
      alert("Upload artwork first")
      return
    }

    const formData = new FormData()
    formData.append("artwork", file)

    try {
      setUploading(true)

      await api.patch(`/orders/${selectedOrder._id}/artwork`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      alert("✅ Artwork attached to order")

      setFile(null)
      setSelectedOrderId("")
    } catch (err) {
      console.error("❌ UPLOAD ERROR:", err)
      alert("❌ Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <p style={eyebrowStyle}>Artwork Upload</p>
        <h2 style={titleStyle}>🎨 Mockup Generator</h2>
        <p style={descriptionStyle}>
          Attach customer artwork to an existing order so it can be used for
          mockups, proofs, and production.
        </p>
      </div>

      <div style={panelStyle}>
        <label style={labelStyle}>Select Order</label>

        <select
          value={selectedOrderId}
          onChange={(event) => setSelectedOrderId(event.target.value)}
          style={selectStyle}
          disabled={loadingOrders || uploading}
        >
          <option value="">
            {loadingOrders ? "Loading orders..." : "Select Order"}
          </option>

          {orders.map((order) => (
            <option key={order._id} value={order._id}>
              {order.customerName || "Unknown Customer"} —{" "}
              {order.status || "No Status"}
            </option>
          ))}
        </select>

        {!loadingOrders && orders.length === 0 && (
          <p style={warningStyle}>⚠ No orders found</p>
        )}

        {!selectedOrder && !loadingOrders && (
          <p style={mutedStyle}>⚠ No order selected</p>
        )}

        {selectedOrder && (
          <div style={selectedBoxStyle}>
            <p style={selectedTextStyle}>
              ✅ Selected:{" "}
              <strong>{selectedOrder.customerName || "Unknown Customer"}</strong>
            </p>

            <p style={smallTextStyle}>
              Status: {selectedOrder.status || "N/A"}
            </p>

            {selectedOrder.email && (
              <p style={smallTextStyle}>
                Email: {selectedOrder.email}
              </p>
            )}
          </div>
        )}

        <label style={labelStyle}>Upload Artwork File</label>

        <input
          type="file"
          onChange={handleFileChange}
          style={fileInputStyle}
          disabled={uploading}
          accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,.ai,.psd"
        />

        {file && (
          <p style={fileNameStyle}>
            Selected file: <strong>{file.name}</strong>
          </p>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || !selectedOrder || !file}
          style={{
            ...buttonStyle,
            opacity: uploading || !selectedOrder || !file ? 0.55 : 1,
            cursor:
              uploading || !selectedOrder || !file
                ? "not-allowed"
                : "pointer",
          }}
        >
          {uploading ? "Uploading..." : "Save Mockup"}
        </button>
      </div>
    </div>
  )
}

const containerStyle = {
  padding: "24px",
  color: "#ffffff",
  background: "#020617",
  minHeight: "100%",
}

const headerStyle = {
  marginBottom: "20px",
}

const eyebrowStyle = {
  margin: 0,
  color: "#06b6d4",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
}

const titleStyle = {
  margin: "8px 0",
  fontSize: "28px",
}

const descriptionStyle = {
  maxWidth: "680px",
  color: "#94a3b8",
  lineHeight: 1.6,
}

const panelStyle = {
  maxWidth: "680px",
  padding: "20px",
  border: "1px solid #1e293b",
  borderRadius: "16px",
  background: "#0f172a",
  boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
}

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  marginTop: "14px",
  fontSize: "14px",
  fontWeight: 700,
  color: "#e5e7eb",
}

const selectStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#020617",
  color: "#ffffff",
  outline: "none",
}

const selectedBoxStyle = {
  marginTop: "14px",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #164e63",
  background: "rgba(6, 182, 212, 0.08)",
}

const selectedTextStyle = {
  margin: 0,
  color: "#e0f2fe",
}

const smallTextStyle = {
  margin: "6px 0 0",
  color: "#94a3b8",
  fontSize: "13px",
}

const mutedStyle = {
  color: "#94a3b8",
  fontSize: "14px",
}

const warningStyle = {
  color: "#facc15",
  fontSize: "14px",
}

const fileInputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px dashed #334155",
  background: "#020617",
  color: "#e5e7eb",
}

const fileNameStyle = {
  marginTop: "10px",
  color: "#cbd5e1",
  fontSize: "14px",
}

const buttonStyle = {
  marginTop: "18px",
  width: "100%",
  padding: "12px 16px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(135deg, #06b6d4, #2563eb)",
  color: "#ffffff",
  fontWeight: 800,
}

export default UploadArtwork