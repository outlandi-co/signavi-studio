import { useState } from "react"
import BarcodeScanner from "react-qr-barcode-scanner"
import api from "../services/api"

function Scanner({ onClose }) {

  const [scanned, setScanned] = useState(false)

  const handleScan = async (err, result) => {

    /* 🔥 HANDLE CAMERA ERRORS */
    if (err) {
      console.warn("Scanner error:", err)
      return
    }

    /* 🔥 PREVENT MULTIPLE SCANS */
    if (!result || scanned) return

    setScanned(true)

    const orderId = result.text

    try {
      await api.patch(`/orders/${orderId}/status`, {
        status: "shipped"
      })

      alert("📦 Order shipped!")

    } catch (error) {
      console.error(error)
      alert("❌ Failed to update")
    }

  }

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "black",
      zIndex: 999
    }}>

      {/* CLOSE BUTTON */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          padding: "10px 15px",
          background: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: "6px",
          zIndex: 1000
        }}
      >
        ❌ Close
      </button>

      {/* SCANNER */}
      <BarcodeScanner
        width={"100%"}
        height={"100%"}
        onUpdate={handleScan}
      />

    </div>
  )
}

export default Scanner