import React, { useState } from "react"
import api from "../services/api"

function JobCard({ job, onUpdate }) {
  const [price, setPrice] = useState(job?.price || "")
  const [loading, setLoading] = useState(false)
  const [shipping, setShipping] = useState(false)

  if (!job) return null

  const isQuote = job.source === "quote"

  /* ================= APPROVE ================= */
  const handleApprove = async (e) => {
    e.stopPropagation()

    let finalPrice = Number(price)

    if (!finalPrice || finalPrice <= 0) {
      alert("Enter a valid price before approving")
      return
    }

    setLoading(true)

    try {
      // 🔥 STEP 1: SAVE PRICE FIRST
      await api.patch(`/quotes/${job._id}`, {
        price: finalPrice
      })

      // 🔥 STEP 2: APPROVE (THIS TRIGGERS EMAIL)
      const res = await api.patch(`/quotes/${job._id}/approve`)

      console.log("✅ APPROVED:", res.data)

      alert("✅ Quote approved & email sent")

      if (onUpdate) onUpdate()

    } catch (err) {
      console.error("❌ APPROVE ERROR:", err.response?.data || err.message)
      alert(err?.response?.data?.message || "Approve failed")
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
      await api.patch(`/quotes/${job._id}/deny`, {
        reason
      })

      if (onUpdate) onUpdate()

    } catch (err) {
      console.error("❌ DENY ERROR:", err.response?.data || err.message)
      alert("Deny failed")
    } finally {
      setLoading(false)
    }
  }

  /* ================= 🚚 SHIP ================= */
  const handleShip = async (e) => {
    e.stopPropagation()

    const confirmShip = window.confirm("Ship this order?")
    if (!confirmShip) return

    setShipping(true)

    try {
      await api.post(`/orders/ship/${job._id}`)

      console.log("🚚 SHIPPED")

      if (onUpdate) onUpdate()

    } catch (err) {
      console.error("❌ SHIP ERROR:", err.response?.data || err.message)
      alert("Shipping failed")
    } finally {
      setShipping(false)
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

      {/* ================= 🚚 SHIPPING BUTTON ================= */}
      {job.status === "shipping" && (
        <button onClick={handleShip} style={shipBtn} disabled={shipping}>
          {shipping ? "Shipping..." : "🚚 Ship Order"}
        </button>
      )}

      {/* ================= SHIPPED ================= */}
      {job.status === "shipped" && (
        <p style={{ color: "#22c55e", marginTop: 8 }}>
          ✔ Shipped
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

const shipBtn = {
  marginTop: 10,
  background: "#22c55e",
  border: "none",
  padding: "8px 12px",
  borderRadius: 6,
  cursor: "pointer"
}

const status = (s) => ({
  background:
    s === "payment_required" ? "#f59e0b" :
    s === "production" ? "#3b82f6" :
    s === "shipping" ? "#10b981" :
    s === "shipped" ? "#22c55e" :
    "#64748b",
  padding: "2px 8px",
  borderRadius: 6,
  fontSize: 12
})

export default JobCard