import { useDraggable } from "@dnd-kit/core"
import api from "../services/api"

function DraggableCard({ job, onOpen }) {

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: job?._id || "fallback-id"
  })

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined
  }

  if (!job) return null

  const imageUrl = job.artwork
    ? `http://localhost:5050/uploads/${job.artwork}`
    : null

  const saveTracking = async (tracking) => {
    if (!tracking) return

    const endpoint =
      job.type === "quote"
        ? `/quotes/${job._id}/tracking`
        : `/orders/${job._id}/tracking`

    try {
      await api.patch(endpoint, { trackingNumber: tracking })
    } catch (err) {
      console.error("Tracking error:", err)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: "#fff",
        borderRadius: "12px",
        padding: "12px",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (onOpen) onOpen(job)
      }}
      {...listeners}
      {...attributes}
    >

      {/* IMAGE */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Artwork preview"
          style={{
            width: "100%",
            height: "120px",
            objectFit: "cover",
            borderRadius: "8px",
            marginBottom: "8px"
          }}
        />
      )}

      <p style={{ fontSize: "12px", color: "#06b6d4" }}>
        {job.type === "quote" ? "Custom Request" : "Store Order"}
      </p>

      <p style={{ fontWeight: "600" }}>
        {job.customerName || "No Name"}
      </p>

      <p style={{ fontSize: "12px", color: "#6b7280" }}>
        {job.printType || "—"}
      </p>

      <p style={{ fontSize: "11px", color: "#9ca3af" }}>
        {job.status || "pending"}
      </p>

      {/* TRACKING */}
      {job.status === "shipping" && (
        <input
          placeholder="Tracking..."
          onClick={(e) => e.stopPropagation()}
          onBlur={(e) => saveTracking(e.target.value)}
          style={{ marginTop: "6px", width: "100%" }}
        />
      )}

      {job.trackingNumber && (
        <p style={{ fontSize: "11px", color: "green" }}>
          📦 {job.trackingNumber}
        </p>
      )}

    </div>
  )
}

export default DraggableCard