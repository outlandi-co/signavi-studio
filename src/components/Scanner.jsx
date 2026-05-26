import { useState } from "react"
import BarcodeScanner from "react-qr-barcode-scanner"
import api from "../services/api"

function Scanner({ onClose }) {
  const [scanned, setScanned] = useState(false)
  const [message, setMessage] = useState("Point camera at order QR code")

  const handleScan = async (err, result) => {
    if (err) {
      console.warn("Scanner error:", err)
      return
    }

    if (!result || scanned) return

    const orderId = result.text?.trim()

    if (!orderId) {
      setMessage("❌ Invalid QR code")
      return
    }

    setScanned(true)
    setMessage("Updating order status...")

    try {
      await api.patch(`/orders/${orderId}/status`, {
        status: "shipped",
      })

      setMessage("📦 Order marked as shipped!")

      setTimeout(() => {
        onClose?.()
      }, 1200)
    } catch (error) {
      console.error("Failed to update order:", error)
      setMessage("❌ Failed to update order")

      setTimeout(() => {
        setScanned(false)
        setMessage("Point camera at order QR code")
      }, 1500)
    }
  }

  return (
    <div style={overlayStyle}>
      <button onClick={onClose} style={closeButtonStyle}>
        ❌ Close
      </button>

      <div style={messageStyle}>{message}</div>

      <BarcodeScanner
        width="100%"
        height="100%"
        onUpdate={handleScan}
      />
    </div>
  )
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "#000",
  zIndex: 999,
}

const closeButtonStyle = {
  position: "absolute",
  top: 20,
  right: 20,
  padding: "10px 15px",
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  zIndex: 1000,
  cursor: "pointer",
}

const messageStyle = {
  position: "absolute",
  top: 20,
  left: 20,
  padding: "10px 14px",
  background: "rgba(15, 23, 42, 0.85)",
  color: "#fff",
  borderRadius: "8px",
  zIndex: 1000,
  fontSize: "14px",
}

export default Scanner