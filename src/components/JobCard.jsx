import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState } from "react"
import api from "../services/api"

const API_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://signavi-backend.onrender.com"

export default function JobCard({ job }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: job._id,
    data: {
      type: "card",
      job
    }
  })

  const [tracking, setTracking] = useState("")

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    background: "#020617",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    border: "1px solid #1e293b",
    color: "white"
  }

  const artworkUrl = job.artwork
    ? job.artwork.startsWith("http")
      ? job.artwork
      : `${API_URL}${job.artwork.startsWith("/uploads") ? "" : "/uploads/"}${job.artwork}`
    : null

  const itemsTotal = (job.items || []).reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  )

  const final = Number(job.finalPrice || itemsTotal || 0)

  /* ================= ACTIONS ================= */

  const approve = async () => {
    await api.patch(`/orders/${job._id}/status`, {
      status: "ready_for_production"
    })
    window.location.reload()
  }

  const deny = async () => {
    await api.patch(`/orders/${job._id}/status`, {
      status: "denied"
    })
    window.location.reload()
  }

  const addTracking = async () => {
    if (!tracking) return

    await api.patch(`/orders/${job._id}/status`, {
      status: "shipping",
      trackingNumber: tracking
    })

    window.location.reload()
  }

  return (
    <div ref={setNodeRef} style={style}>

      {/* DRAG HANDLE */}
      <div
        {...attributes}
        {...listeners}
        style={{ cursor: "grab", fontSize: 10, opacity: 0.5 }}
      >
        ⠿ drag
      </div>

      {/* CUSTOMER */}
      <p><b>{job.customerName || "Guest"}</b></p>

      {/* STATUS */}
      <p style={{ fontSize: 12, opacity: 0.7 }}>
        {job.status}
      </p>

      {/* ARTWORK PREVIEW */}
      {artworkUrl && (
        <img
          src={artworkUrl}
          alt="artwork"
          style={{
            width: "100%",
            height: 120,
            objectFit: "cover",
            borderRadius: 6,
            marginTop: 8
          }}
        />
      )}

      {/* DOWNLOAD */}
      {artworkUrl && (
        <a
          href={artworkUrl}
          download
          style={{ fontSize: 12, color: "#38bdf8" }}
        >
          ⬇ Download Artwork
        </a>
      )}

      {/* PRICE */}
      <p style={{ color: "#22c55e", fontWeight: "bold" }}>
        💰 ${final.toFixed(2)}
      </p>

      {/* ITEMS */}
      <div style={{ fontSize: 12 }}>
        {job.items?.map((item, i) => (
          <p key={i}>
            {item.name} x{item.quantity}
          </p>
        ))}
      </div>

      {/* APPROVE / DENY */}
      {job.status === "payment_required" && (
        <div style={{ marginTop: 8 }}>
          <button onClick={approve}>✅ Approve</button>
          <button onClick={deny}>❌ Deny</button>
        </div>
      )}

      {/* TRACKING */}
      {job.status === "shipping" && (
        <div style={{ marginTop: 8 }}>
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="Tracking #"
          />
          <button onClick={addTracking}>Ship</button>
        </div>
      )}

      {/* SHOW TRACKING */}
      {job.trackingNumber && (
        <p style={{ fontSize: 12 }}>
          📦 {job.trackingNumber}
        </p>
      )}

    </div>
  )
}