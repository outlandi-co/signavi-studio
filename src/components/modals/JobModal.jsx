import { useState, useEffect } from "react"
import api from "../../services/api"

function JobModal({ job, onClose, refresh }) {

  const [status, setStatus] = useState(job?.status || "pending")
  const [price, setPrice] = useState(job?.price || "")
  const [shipping, setShipping] = useState(job?.shippingCost || "")
  const [tracking, setTracking] = useState(job?.trackingNumber || "")
  const [trackingLink, setTrackingLink] = useState(job?.trackingLink || "")
  const [loading, setLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState(null)

  /* ================= AI ================= */
  useEffect(() => {
    if (!job) return

    if (!job.artwork) setAiSuggestion("reject ❌")
    else if (job.quantity > 50) setAiSuggestion("approve ✅")
    else setAiSuggestion("review ⚠️")
  }, [job])

  if (!job) return null

  /* ================= STATUS ================= */
  const updateStatus = async () => {
    setLoading(true)
    try {
      await api.patch(`/orders/${job._id}/status`, { status })
      refresh()
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /* ================= APPROVE ================= */
  const handleApprove = async () => {
    if (!job.artwork) {
      return alert("❌ Cannot approve: No artwork uploaded")
    }

    if (!price) return alert("Enter price")

    setLoading(true)

    try {
      await api.patch(`/orders/${job._id}/approve`, {
        price: Number(price),
        shipping: Number(shipping || 0)
      })

      refresh()
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /* ================= DENY ================= */
  const handleDeny = async () => {
    if (!confirm("Deny this order?")) return

    setLoading(true)

    try {
      await api.patch(`/orders/${job._id}/deny`)
      refresh()
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /* ================= TRACKING ================= */
  const handleTracking = async () => {
    if (!tracking) return alert("Enter tracking number")

    setLoading(true)

    try {
      await api.patch(`/orders/${job._id}/tracking`, {
        trackingNumber: tracking,
        trackingLink
      })

      alert("📦 Tracking added!")
      refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /* ================= SEND EMAIL (NEW 🔥) ================= */
const sendArtworkEmail = async () => {
  try {
    console.log("🧠 FRONTEND ORDER ID:", job._id)
    console.log("📦 FULL JOB:", job)

    setLoading(true)

    const res = await api.post(`/orders/send-artwork/${job._id}`)

    console.log("📧 EMAIL RESPONSE:", res.data)

    alert("📧 Artwork sent to your email!")

  } catch (err) {
    console.error("❌ EMAIL ERROR:", err.response?.data || err)
    alert("❌ Failed to send email")
  } finally {
    setLoading(false)
  }
}
  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!confirm("Delete this job?")) return

    setLoading(true)

    try {
      await api.delete(`/orders/${job._id}`)
      refresh()
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>

        <button onClick={onClose} style={closeBtn}>✖</button>

        <h2>Production Control</h2>

        {/* AI */}
        {aiSuggestion && <p style={aiBox}>🤖 {aiSuggestion}</p>}

        {/* ================= CUSTOMER ================= */}
        <h3>👤 Customer</h3>
        <p><b>Name:</b> {job.customerName}</p>
        <p><b>Email:</b> {job.email || "N/A"}</p>
        <p>
          <b>Address:</b>{" "}
          {job.shippingAddress?.street
            ? `${job.shippingAddress.street}, ${job.shippingAddress.city}`
            : "N/A"}
        </p>

        {/* ================= ORDER ================= */}
        <h3>🛍 Order Details</h3>

        {job.items?.length > 0 ? (
          job.items.map((item, i) => (
            <div key={i} style={itemBox}>
              <p><b>{item.name}</b></p>
              <p>Qty: {item.quantity}</p>
              <p>Price: ${item.price}</p>
            </div>
          ))
        ) : (
          <p>No item details</p>
        )}

        {/* ================= ARTWORK ================= */}
        <h3>🎨 Artwork</h3>

        {job.artwork ? (
          <>
            <a
              href={`http://localhost:5050/uploads/${job.artwork}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#38bdf8" }}
            >
              View Artwork
            </a>

            <br />

            <a
              href={`http://localhost:5050/uploads/${job.artwork}`}
              download
              style={{ color: "#22c55e" }}
            >
              ⬇ Download Artwork
            </a>

            {/* 🔥 EMAIL BUTTON */}
            <button
              onClick={sendArtworkEmail}
              style={{
                marginTop: "10px",
                background: "#06b6d4",
                padding: "10px",
                borderRadius: "6px",
                color: "white",
                width: "100%"
              }}
            >
              📧 Send Artwork to Email
            </button>
          </>
        ) : (
          <p style={{ color: "#ef4444" }}>❌ No artwork uploaded</p>
        )}

        {/* ================= APPROVAL ================= */}
        {job.approvalStatus === "pending" && (
          <>
            <h3>💰 Approve</h3>

            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" style={input} />
            <input value={shipping} onChange={(e) => setShipping(e.target.value)} placeholder="Shipping" style={input} />

            <button onClick={handleApprove} style={{ ...btn, background: "#22c55e" }}>
              {loading ? "Processing..." : "Approve"}
            </button>

            <button onClick={handleDeny} style={{ ...btn, background: "#ef4444" }}>
              Deny
            </button>
          </>
        )}

        {/* ================= STATUS + TRACKING ================= */}
        {job.approvalStatus !== "pending" && job.status !== "denied" && (
          <>
            <h3>⚙️ Status</h3>

            <select value={status} onChange={(e) => setStatus(e.target.value)} style={input}>
              <option value="approved">Approved</option>
              <option value="printing">Printing</option>
              <option value="shipping">Shipping</option>
              <option value="shipped">Shipped</option>
            </select>

            <button onClick={updateStatus} style={btn}>
              {loading ? "Updating..." : "Update"}
            </button>

            <h3>📦 Tracking</h3>

            <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Tracking Number" style={input} />
            <input value={trackingLink} onChange={(e) => setTrackingLink(e.target.value)} placeholder="Tracking Link" style={input} />

            <button onClick={handleTracking} style={{ ...btn, background: "#2563eb" }}>
              Add Tracking
            </button>
          </>
        )}

        {/* ================= TIMELINE ================= */}
        <h3>🕒 Timeline</h3>

        {job.timeline?.length > 0 ? (
          job.timeline.map((t, i) => (
            <p key={i}>{t.status} - {new Date(t.date).toLocaleString()}</p>
          ))
        ) : (
          <p>No timeline yet</p>
        )}

        {/* DELETE */}
        <button onClick={handleDelete} style={{ ...btn, background: "#dc2626" }}>
          Delete
        </button>

      </div>
    </div>
  )
}

/* ================= STYLES ================= */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.8)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
}

const modal = {
  background: "#020617",
  padding: "20px",
  borderRadius: "12px",
  width: "450px",
  color: "#fff"
}

const btn = {
  padding: "10px",
  borderRadius: "6px",
  border: "none",
  marginTop: "8px",
  color: "#fff",
  cursor: "pointer"
}

const input = {
  width: "100%",
  marginTop: "8px",
  padding: "8px"
}

const closeBtn = {
  float: "right",
  background: "none",
  border: "none",
  color: "#fff",
  cursor: "pointer"
}

const aiBox = {
  background: "#020617",
  padding: "6px",
  borderRadius: "6px",
  color: "#06b6d4"
}

const itemBox = {
  background: "#0f172a",
  padding: "8px",
  borderRadius: "6px",
  marginBottom: "6px"
}

export default JobModal