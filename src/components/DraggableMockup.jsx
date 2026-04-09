import { useDraggable } from "@dnd-kit/core"
import api from "../services/api"

const API_URL = import.meta.env.VITE_API_URL || "https://signavi-backend.onrender.com"

function DraggableMockup({ job, onOpen = null }) {

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: job?._id || "fallback-id"
  })

  if (!job) return null

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px) scale(1.05)`
      : "scale(1)",
    transition: "transform 0.2s ease",
    zIndex: transform ? 999 : 1
  }

  const artworkUrl = job.artwork
    ? `${API_URL}/uploads/${job.artwork}`
    : null

  /* ================= ACTIONS ================= */

  const approve = async (e) => {
    e.stopPropagation()
    try {
      await api.patch(`/orders/${job._id}/approve`)
      window.location.reload()
    } catch (err) {
      console.error("❌ APPROVE ERROR:", err)
    }
  }

  const deny = async (e) => {
    e.stopPropagation()
    try {
      await api.patch(`/orders/${job._id}/deny`)
      window.location.reload()
    } catch (err) {
      console.error("❌ DENY ERROR:", err)
    }
  }

  const restore = async (e) => {
    e.stopPropagation()
    try {
      await api.patch(`/orders/${job._id}/restore`)
      window.location.reload()
    } catch (err) {
      console.error("❌ RESTORE ERROR:", err)
    }
  }

  const addTracking = async (e) => {
    e.stopPropagation()

    try {
      const tracking = prompt("Tracking number")
      const link = prompt("Tracking link")

      if (!tracking) return

      await api.patch(`/orders/${job._id}/status`, {
        status: "shipping",
        trackingNumber: tracking,
        trackingLink: link
      })

      window.location.reload()

    } catch (err) {
      console.error("❌ TRACKING ERROR:", err)
    }
  }

  /* ================= COLORS ================= */
  const statusColor = {
    artwork_sent: "#facc15",
    payment_required: "#22c55e",
    production: "#3b82f6",
    shipping: "#f97316",
    shipped: "#10b981",
    denied: "#ef4444",
    archive: "#64748b"
  }

  const color = statusColor[job.status] || "#334155"

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: "#020617",
        padding: "12px",
        borderRadius: "12px",
        border: `1px solid ${color}`,
        boxShadow: transform
          ? `0 10px 25px ${color}`
          : `0 0 10px ${color}`,
        marginBottom: "10px",
        cursor: "pointer"
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (onOpen) onOpen(job)
      }}
    >

      <div {...listeners} {...attributes} style={{ cursor: "grab", fontSize: "10px", opacity: 0.5 }}>
        ⠿ drag
      </div>

      <p style={{ color: "white", fontWeight: "600" }}>
        {job.customerName}
      </p>

      <p style={{ color }}>{job.status}</p>

      {job?.finalPrice > 0 && (
        <p style={{ color: "#22c55e", fontWeight: "bold" }}>
          💰 ${job.finalPrice}
        </p>
      )}

      {artworkUrl && (
        <a href={artworkUrl} download onClick={(e) => e.stopPropagation()}>
          ⬇ Download Artwork
        </a>
      )}

      {/* 🔥 APPROVAL */}
      {job.status === "artwork_sent" && (
        <div style={{ marginTop: "6px" }}>
          <button onClick={approve}>✅ Approve</button>
          <button onClick={deny}>❌ Deny</button>
        </div>
      )}

      {/* TRACKING */}
      {job.status === "shipping" && (
        <button onClick={addTracking}>Add Tracking</button>
      )}

      {/* RESTORE */}
      {job.status === "archive" && (
        <button onClick={restore}>🔄 Restore</button>
      )}

      {job.trackingNumber && <p>📦 {job.trackingNumber}</p>}

    </div>
  )
}

export default DraggableMockup