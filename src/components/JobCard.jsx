import React, { useState } from "react"
import { useDraggable } from "@dnd-kit/core"
import api from "../services/api"

function JobCard({ job, onUpdate }) {
  const [price, setPrice] = useState(job?.price || "")
  const [loading, setLoading] = useState(false)
  const [shipping, setShipping] = useState(false)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: job._id,
    data: {
      type: "card",
      job
    }
  })

  const style = {
    ...card,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition: isDragging ? "none" : "transform 0.2s ease",
    opacity: isDragging ? 0.6 : 1,
    willChange: "transform"
  }

  if (!job) return null

  const isQuote = job.source === "quote"

  /* ================= APPROVE ================= */
  const handleApprove = async (e) => {
    e.stopPropagation()

    const finalPrice = Number(price)
    if (!finalPrice || finalPrice <= 0) {
      alert("Enter a valid price before approving")
      return
    }

    setLoading(true)

    try {
      await api.patch(`/quotes/${job._id}`, { price: finalPrice })
      await api.patch(`/quotes/${job._id}/approve`)
      alert("✅ Quote approved & email sent")
      onUpdate?.()
    } catch (err) {
      console.error("❌ APPROVE ERROR:", err)
      alert("Approve failed")
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
      await api.patch(`/quotes/${job._id}/deny`, { reason })
      onUpdate?.()
    } catch (err) {
      console.error("❌ DENY ERROR:", err)
    } finally {
      setLoading(false)
    }
  }

  /* ================= SHIP ================= */
  const handleShip = async (e) => {
    e.stopPropagation()

    if (!window.confirm("Ship this order?")) return

    setShipping(true)

    try {
      await api.post(`/orders/ship/${job._id}`)
      onUpdate?.()
    } catch (err) {
      console.error("❌ SHIP ERROR:", err)
    } finally {
      setShipping(false)
    }
  }

  /* ================= DOWNLOAD ================= */
  const handleDownloadArtwork = (e) => {
    e.stopPropagation()

    if (!job.artwork) {
      alert("No artwork uploaded")
      return
    }

    window.open(
      `${import.meta.env.VITE_API_URL}/orders/${job._id}/artwork`,
      "_blank"
    )
  }

  /* ================= PREVIEW ================= */
  const handlePreviewArtwork = (e) => {
    e.stopPropagation()

    if (!job.artwork) {
      alert("No artwork uploaded")
      return
    }

    window.open(
      `${import.meta.env.VITE_API_URL}/${job.artwork}`,
      "_blank"
    )
  }

  const fileType = job.artwork?.split(".").pop()?.toLowerCase()
  const canPreview = ["png", "jpg", "jpeg", "pdf"].includes(fileType)

  return (
    <div ref={setNodeRef} style={style}>
      
      {/* 🔥 DRAG HANDLE */}
      <div {...listeners} {...attributes} style={dragHandle}>
        ☰ Drag
      </div>

      <p><b>{job.customerName || "Guest"}</b></p>
      <p>Qty: {job.quantity}</p>

      <p>
        Status: <span style={status(job.status)}>{job.status}</span>
      </p>

      {/* ================= ARTWORK SECTION ================= */}
      {job.artwork && (
        <div style={{ marginTop: 10 }}>
          
          <p style={{ fontSize: 12, color: "#94a3b8" }}>
            File: {fileType?.toUpperCase()}
          </p>

          <div style={{ display: "flex", gap: 8 }}>

            {canPreview && (
              <button onClick={handlePreviewArtwork} style={previewBtn}>
                👁 Preview
              </button>
            )}

            <button onClick={handleDownloadArtwork} style={downloadBtn}>
              ⬇️ Download
            </button>

          </div>
        </div>
      )}

      {/* ================= QUOTE MODE ================= */}
      {isQuote && job.approvalStatus !== "approved" && (
        <>
          <p style={{ color: "#facc15" }}>Awaiting approval</p>

          <input
            type="number"
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

      {/* ================= SHIPPING ================= */}
      {job.status === "shipping" && (
        <button onClick={handleShip} style={shipBtn} disabled={shipping}>
          {shipping ? "Shipping..." : "🚚 Ship Order"}
        </button>
      )}

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

const dragHandle = {
  cursor: "grab",
  marginBottom: 10,
  fontWeight: "bold",
  userSelect: "none"
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

const downloadBtn = {
  background: "#2563eb",
  border: "none",
  padding: "8px 12px",
  borderRadius: 6,
  cursor: "pointer",
  color: "white"
}

const previewBtn = {
  background: "#0ea5e9",
  border: "none",
  padding: "8px 12px",
  borderRadius: 6,
  cursor: "pointer",
  color: "white"
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