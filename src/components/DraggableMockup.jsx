import { useDraggable } from "@dnd-kit/core"
import api from "../services/api"

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "https://signavi-backend.onrender.com"

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const formatStatus = (value = "") => {
  return String(value || "unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const resolveArtworkUrl = (artwork = "") => {
  if (!artwork) return ""

  if (typeof artwork !== "string") {
    return artwork.url || artwork.path || ""
  }

  if (artwork.startsWith("http")) return artwork
  if (artwork.startsWith("/uploads")) return `${API_BASE}${artwork}`
  if (artwork.startsWith("uploads")) return `${API_BASE}/${artwork}`

  return `${API_BASE}/uploads/${artwork}`
}

const getStatusColor = (status = "") => {
  const colors = {
    artwork_sent: "#facc15",
    payment_required: "#22c55e",
    ready_for_production: "#38bdf8",
    production: "#3b82f6",
    shipping: "#f97316",
    shipped: "#10b981",
    delivered: "#22c55e",
    denied: "#ef4444",
    archive: "#64748b"
  }

  return colors[status] || "#334155"
}

function DraggableMockup({
  job,
  onOpen = null,
  onUpdated = null
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: job?._id || "fallback-id",
    data: {
      type: "job",
      job
    }
  })

  if (!job) return null

  const color = getStatusColor(job.status)

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(1.04)`
      : "translate3d(0, 0, 0) scale(1)",
    transition: transform ? "none" : "transform 0.2s ease",
    zIndex: transform ? 999 : 1,
    opacity: isDragging ? 0.72 : 1
  }

  const artworkUrl =
    resolveArtworkUrl(job.artwork)

  const refresh = async () => {
    if (onUpdated) {
      await onUpdated()
      return
    }

    window.location.reload()
  }

  const approve = async (event) => {
    event.stopPropagation()

    try {
      await api.patch(`/orders/${job._id}/approve`)
      await refresh()
    } catch (err) {
      console.error("❌ APPROVE ERROR:", err.response?.data || err)
      alert("Could not approve this order.")
    }
  }

  const deny = async (event) => {
    event.stopPropagation()

    try {
      await api.patch(`/orders/${job._id}/deny`)
      await refresh()
    } catch (err) {
      console.error("❌ DENY ERROR:", err.response?.data || err)
      alert("Could not deny this order.")
    }
  }

  const restore = async (event) => {
    event.stopPropagation()

    try {
      await api.patch(`/orders/${job._id}/restore`)
      await refresh()
    } catch (err) {
      console.error("❌ RESTORE ERROR:", err.response?.data || err)
      alert("Could not restore this order.")
    }
  }

  const addTracking = async (event) => {
    event.stopPropagation()

    const trackingNumber = window.prompt("Tracking number")
    if (!trackingNumber) return

    const trackingLink =
      window.prompt("Tracking link") || ""

    try {
      await api.patch(`/orders/${job._id}`, {
        status: "shipping",
        trackingNumber,
        trackingLink
      })

      await refresh()
    } catch (err) {
      console.error("❌ TRACKING ERROR:", err.response?.data || err)
      alert("Could not add tracking.")
    }
  }

  return (
    <article
      ref={setNodeRef}
      style={{
        ...style,
        background: "#020617",
        padding: 14,
        borderRadius: 16,
        border: `1px solid ${color}`,
        boxShadow: transform
          ? `0 18px 35px ${color}55`
          : `0 0 14px ${color}33`,
        marginBottom: 12,
        color: "white",
        cursor: "pointer"
      }}
      onClick={(event) => {
        event.stopPropagation()
        onOpen?.(job)
      }}
    >
      <div
        {...listeners}
        {...attributes}
        style={dragHandle}
      >
        ⠿ drag
      </div>

      <div style={header}>
        <div>
          <p style={orderId}>
            #{String(job.orderId || job._id || "").slice(-6).toUpperCase()}
          </p>

          <p style={customerName}>
            {job.customerName || "Guest"}
          </p>

          <p style={emailText}>
            {job.email || "No email"}
          </p>
        </div>

        <strong style={{ color: "#22c55e" }}>
          {money(job.finalPrice || job.total || job.price)}
        </strong>
      </div>

      <div style={statusRow}>
        <span
          style={{
            ...statusBadge,
            borderColor: color,
            color
          }}
        >
          {formatStatus(job.status)}
        </span>

        {job.priority && (
          <span style={priorityBadge}>
            {formatStatus(job.priority)}
          </span>
        )}
      </div>

      {job.items?.length > 0 && (
        <div style={itemsBox}>
          {job.items.slice(0, 3).map((item, index) => (
            <p
              key={`${item.name || "item"}-${index}`}
              style={itemText}
            >
              {item.name || "Item"} x{item.quantity || 1}
            </p>
          ))}
        </div>
      )}

      {artworkUrl && (
        <a
          href={artworkUrl}
          download
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          style={artworkLink}
        >
          ⬇ Download Artwork
        </a>
      )}

      {job.status === "artwork_sent" && (
        <div style={buttonRow}>
          <button
            type="button"
            onClick={approve}
            style={approveButton}
          >
            ✅ Approve
          </button>

          <button
            type="button"
            onClick={deny}
            style={denyButton}
          >
            ❌ Deny
          </button>
        </div>
      )}

      {job.status === "shipping" && (
        <button
          type="button"
          onClick={addTracking}
          style={trackingButton}
        >
          Add Tracking
        </button>
      )}

      {job.status === "archive" && (
        <button
          type="button"
          onClick={restore}
          style={restoreButton}
        >
          🔄 Restore
        </button>
      )}

      {job.trackingNumber && (
        <p style={trackingText}>
          📦 {job.trackingNumber}
        </p>
      )}
    </article>
  )
}

const dragHandle = {
  cursor: "grab",
  fontSize: 11,
  opacity: 0.55,
  marginBottom: 8,
  userSelect: "none"
}

const header = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start"
}

const orderId = {
  margin: 0,
  color: "#67e8f9",
  fontSize: 12,
  fontWeight: 900
}

const customerName = {
  margin: "4px 0 0",
  fontWeight: 900
}

const emailText = {
  margin: "4px 0 0",
  color: "#94a3b8",
  fontSize: 12
}

const statusRow = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 12
}

const statusBadge = {
  border: "1px solid",
  borderRadius: 999,
  padding: "4px 8px",
  fontSize: 11,
  fontWeight: 900
}

const priorityBadge = {
  border: "1px solid rgba(250,204,21,0.45)",
  background: "rgba(250,204,21,0.14)",
  color: "#fde68a",
  borderRadius: 999,
  padding: "4px 8px",
  fontSize: 11,
  fontWeight: 900
}

const itemsBox = {
  marginTop: 12,
  borderTop: "1px solid #1e293b",
  paddingTop: 10
}

const itemText = {
  margin: "3px 0",
  color: "#94a3b8",
  fontSize: 12
}

const artworkLink = {
  display: "inline-block",
  marginTop: 12,
  color: "#67e8f9",
  fontSize: 13,
  fontWeight: 900,
  textDecoration: "none"
}

const buttonRow = {
  display: "flex",
  gap: 8,
  marginTop: 12,
  flexWrap: "wrap"
}

const approveButton = {
  background: "#22c55e",
  color: "#020617",
  border: "none",
  borderRadius: 10,
  padding: "8px 10px",
  fontWeight: 900,
  cursor: "pointer"
}

const denyButton = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "8px 10px",
  fontWeight: 900,
  cursor: "pointer"
}

const trackingButton = {
  marginTop: 12,
  background: "#f97316",
  color: "#020617",
  border: "none",
  borderRadius: 10,
  padding: "8px 10px",
  fontWeight: 900,
  cursor: "pointer"
}

const restoreButton = {
  marginTop: 12,
  background: "#38bdf8",
  color: "#020617",
  border: "none",
  borderRadius: 10,
  padding: "8px 10px",
  fontWeight: 900,
  cursor: "pointer"
}

const trackingText = {
  margin: "10px 0 0",
  color: "#cbd5e1",
  fontSize: 12
}

export default DraggableMockup