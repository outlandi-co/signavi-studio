import { useState } from "react"
import api from "../services/api"

export default function JobCard({ job, onApprove, onDeny }) {
  const [price, setPrice] = useState(job.finalPrice || job.price || 0)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    try {
      setLoading(true)

      await api.patch(`/quotes/${job._id}`, {
        finalPrice: Number(price)
      })

      console.log("💾 Price saved")

    } catch (err) {
      console.error("❌ SAVE ERROR:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        background: "#020617",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        color: "white"
      }}
    >
      <div style={{ fontWeight: "bold" }}>
        {job.customerName || "Unknown"}
      </div>

      <div style={{ color: "#38bdf8" }}>{job.status}</div>

      <div style={{ color: "#22c55e" }}>
        ${Number(price).toFixed(2)}
      </div>

      {/* PRICE INPUT */}
      {job.source === "quote" && (
        <>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={{
              width: "100%",
              marginTop: 6,
              padding: 6,
              borderRadius: 6
            }}
          />

          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 6,
              background: "#2563eb",
              color: "white",
              padding: 6,
              borderRadius: 6
            }}
          >
            Save Price
          </button>

          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <button
              onClick={() => onApprove(job)}
              style={{
                flex: 1,
                background: "#16a34a",
                color: "white",
                padding: 6,
                borderRadius: 6
              }}
            >
              Approve
            </button>

            <button
              onClick={() => onDeny(job)}
              style={{
                flex: 1,
                background: "#dc2626",
                color: "white",
                padding: 6,
                borderRadius: 6
              }}
            >
              Deny
            </button>
          </div>
        </>
      )}
    </div>
  )
}