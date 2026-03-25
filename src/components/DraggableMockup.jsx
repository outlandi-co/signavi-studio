import { useDraggable } from "@dnd-kit/core"
import api from "../services/api"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050"

function DraggableMockup({ job, onOpen = null }) {

  /* ✅ ALWAYS CALL HOOK */
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: job?._id || "fallback-id"
  })

  /* ✅ NOW SAFE TO CHECK */
  if (!job) return null

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined
  }

  const artworkUrl = job.artwork
    ? `${API_URL}/uploads/${job.artwork}`
    : null

  /* ================= ACTIONS ================= */

  const approve = async (e) => {
    e.stopPropagation()

    const price = prompt("Price?")
    const shipping = prompt("Shipping?")

    if (!price || !shipping) return

    await api.patch(`/production/orders/${job._id}/approve`, { price, shipping })
    window.location.reload()
  }

  const deny = async (e) => {
    e.stopPropagation()
    await api.patch(`/production/orders/${job._id}/deny`)
    window.location.reload()
  }

  const addTracking = async (e) => {
    e.stopPropagation()

    const tracking = prompt("Tracking number")
    const link = prompt("Tracking link")

    if (!tracking) return

    await api.patch(`/production/orders/${job._id}/tracking`, {
      trackingNumber: tracking,
      trackingLink: link
    })

    window.location.reload()
  }

  const statusColor = {
    pending: "#facc15",
    approved: "#22c55e",
    printing: "#3b82f6",
    shipping: "#f97316",
    shipped: "#10b981",
    denied: "#ef4444"
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: "#020617",
        padding: "12px",
        borderRadius: "12px",
        border: `1px solid ${statusColor[job.status] || "#334155"}`
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (onOpen) onOpen(job)
      }}
    >

      {/* DRAG HANDLE */}
      <div
        {...listeners}
        {...attributes}
        onClick={(e) => e.stopPropagation()}
        style={{
          cursor: "grab",
          fontSize: "10px",
          opacity: 0.5,
          marginBottom: "6px"
        }}
      >
        ⠿ drag
      </div>

      <p style={{ color: "white", fontWeight: "600" }}>
        {job.customerName}
      </p>

      <p style={{ color: statusColor[job.status], fontSize: "12px" }}>
        {job.status}
      </p>

      {/* DOWNLOAD */}
      {artworkUrl && (
        <a
          href={artworkUrl}
          download
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "block",
            marginTop: "6px",
            background: "#000",
            color: "white",
            padding: "6px",
            borderRadius: "6px",
            textAlign: "center"
          }}
        >
          ⬇ Download Artwork
        </a>
      )}

      {/* APPROVAL */}
      {job.approvalStatus === "pending" && (
        <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
          <button onClick={approve}>Approve</button>
          <button onClick={deny}>Deny</button>
        </div>
      )}

      {/* TRACKING */}
      {job.status === "shipping" && (
        <button onClick={addTracking} style={{ marginTop: "6px" }}>
          Add Tracking
        </button>
      )}

      {/* TRACKING DISPLAY */}
      {job.trackingNumber && (
        <p style={{ color: "#22c55e", fontSize: "11px", marginTop: "6px" }}>
          📦 {job.trackingNumber}
        </p>
      )}

    </div>
  )
}

export default DraggableMockup