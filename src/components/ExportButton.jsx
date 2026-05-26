import { useState } from "react"
import Button from "./UI/Button"

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "https://signavi-backend.onrender.com"

export default function ExportButton() {
  const [loading, setLoading] = useState(false)

  const handleExportOrders = async () => {
    try {
      setLoading(true)

      window.open(
        `${API_BASE}/api/export-orders`,
        "_blank",
        "noopener,noreferrer"
      )
    } catch (err) {
      console.error(
        "❌ EXPORT ORDERS ERROR:",
        err
      )

      alert("Failed to export orders.")
    } finally {
      setLoading(false)
    }
  }

  const handleExportTaxes = async () => {
    try {
      window.open(
        `${API_BASE}/api/export-taxes`,
        "_blank",
        "noopener,noreferrer"
      )
    } catch (err) {
      console.error(
        "❌ EXPORT TAX ERROR:",
        err
      )

      alert("Failed to export taxes.")
    }
  }

  return (
    <div style={wrapper}>
      <Button
        onClick={handleExportOrders}
        variant="primary"
        disabled={loading}
        style={ordersBtn}
      >
        {loading
          ? "Exporting..."
          : "📤 Export Orders CSV"}
      </Button>

      <Button
        onClick={handleExportTaxes}
        variant="secondary"
        style={taxBtn}
      >
        🧾 Export Tax Report
      </Button>
    </div>
  )
}

const wrapper = {
  marginBottom: 20,
  display: "flex",
  gap: 12,
  justifyContent: "flex-end",
  flexWrap: "wrap"
}

const ordersBtn = {
  background:
    "linear-gradient(90deg,#06b6d4,#2563eb)",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  fontWeight: 700,
  padding: "12px 18px",
  boxShadow:
    "0 10px 25px rgba(37,99,235,0.25)"
}

const taxBtn = {
  background:
    "linear-gradient(90deg,#22c55e,#16a34a)",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  fontWeight: 700,
  padding: "12px 18px",
  boxShadow:
    "0 10px 25px rgba(34,197,94,0.25)"
}