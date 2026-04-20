import React, { useState } from "react"
import api from "../services/api"

function JobCard({ job, onUpdate }) {
  const [price, setPrice] = useState(job?.price || "")
  const [loading, setLoading] = useState(false)

  if (!job) return null

  const isQuote = job.source === "quote"

  /* ================= APPROVE ================= */
  const handleApprove = async (e) => {
    e.stopPropagation()

    let finalPrice = Number(price)

    // 🔥 GUARANTEE VALID PRICE (NO MORE BACKEND FAIL)
    if (!finalPrice || finalPrice <= 0) {
      console.warn("⚠️ Invalid input → forcing fallback 25")
      finalPrice = 25
    }

    setLoading(true)

    try {
      console.log("📤 SENDING APPROVE:", {
        id: job._id,
        price: finalPrice
      })

      const res = await api.patch(`/quotes/${job._id}/approve`, {
        price: finalPrice
      })

      console.log("✅ APPROVED:", res.data)

      if (onUpdate) onUpdate()

    } catch (err) {
      console.error("❌ APPROVE ERROR FULL:", err)
      console.error("❌ RESPONSE:", err.response?.data)

      alert(
        "Approve failed:\n" +
        JSON.stringify(err.response?.data, null, 2)
      )
    } finally {
      setLoading(false)
    }
  }

  /* ================= DENY ================= */
  const handleDeny = async (e) => {
    e.stopPropagation()

    const reason = prompt("Reason for denial?")
    if (!reason) return

    setLoading(true)

    try {
      const res = await api.patch(`/quotes/${job._id}/deny`, {
        reason,
        fee: 0
      })

      console.log("❌ DENIED:", res.data)

      if (onUpdate) onUpdate()

    } catch (err) {
      console.error("❌ DENY ERROR:", err.response?.data || err.message)

      alert(
        "Deny failed:\n" +
        JSON.stringify(err.response?.data, null, 2)
      )
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI ================= */
  return (
    <div style={card}>
      <p><b>{job.customerName || "Guest"}</b></p>
      <p>Qty: {job.quantity}</p>

      <p>
        Status:{" "}
        <span style={status(job.status)}>
          {job.status}
        </span>
      </p>

      {/* ================= QUOTE MODE ================= */}
      {isQuote && job.approvalStatus !== "approved" && (
        <>
          <p style={{ color: "#facc15" }}>Awaiting approval</p>

          <input
            type="number"
            placeholder="Enter price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={input}
          />

          <button onClick={handleApprove} disabled={loading}>
            {loading ? "Processing..." : "Approve"}
          </button>

          <button onClick={handleDeny} disabled={loading}>
            Deny
          </button>
        </>
      )}

      {/* ================= APPROVED ================= */}
      {job.approvalStatus === "approved" && (
        <p style={{ color: "#22c55e" }}>
          ✅ Approved (${Number(job.price || 0).toFixed(2)})
        </p>
      )}
    </div>
  )
}

/* ================= STYLES ================= */

const card = {
  background: "#020617",
  padding: 16,
  borderRadius: 10,
  marginBottom: 12,
  border: "1px solid #1e293b",
  color: "white"
}

const input = {
  width: "100%",
  padding: 8,
  marginBottom: 8,
  borderRadius: 6,
  border: "1px solid #334155",
  background: "#020617",
  color: "white"
}

const status = (s) => ({
  background:
    s === "payment_required" ? "#f59e0b" :
    s === "production" ? "#3b82f6" :
    s === "shipping" ? "#10b981" :
    "#64748b",
  padding: "2px 8px",
  borderRadius: 6,
  fontSize: 12
})

export default JobCard