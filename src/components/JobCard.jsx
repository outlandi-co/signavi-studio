import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState } from "react"
import api from "../services/api"

const API_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://signavi-backend.onrender.com"

const formatDate = (date) => {
  if (!date) return ""
  return new Date(date).toLocaleString()
}

const statusColors = {
  payment_required: "#facc15",
  ready_for_production: "#22c55e",
  production: "#3b82f6",
  shipping: "#f97316",
  shipped: "#10b981",
  denied: "#ef4444"
}

export default function JobCard({ job }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: job._id
  })

  const [price, setPrice] = useState(job.finalPrice || 0)
  const [note, setNote] = useState("")
  const [tracking, setTracking] = useState("")

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    background: "#020617",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    border: "1px solid #1e293b",
    color: "#e2e8f0" // 🔥 softer readable text
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

  const updatePrice = async () => {
    await api.patch(`/orders/${job._id}`, {
      finalPrice: Number(price)
    })
  }

  const approve = async () => {
    await api.patch(`/orders/${job._id}/status`, {
      status: "ready_for_production",
      note
    })
    window.location.reload()
  }

  const deny = async () => {
    await api.patch(`/orders/${job._id}/status`, {
      status: "denied",
      note
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

      {/* DRAG */}
      <div {...attributes} {...listeners} style={{ cursor: "grab", fontSize: 10, opacity: 0.5 }}>
        ⠿ drag
      </div>

      {/* HEADER */}
      <p style={{ fontWeight: "bold", color: "white" }}>
        {job.customerName || "Guest"}
      </p>

      <p style={{ fontSize: 12, color: statusColors[job.status] }}>
        {job.status}
      </p>

      {/* IMAGE */}
      {artworkUrl && (
        <img
          src={artworkUrl}
          alt="artwork"
          style={{
            width: "100%",
            height: 120,
            objectFit: "cover",
            borderRadius: 8,
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

      {/* 🔥 PRICE DISPLAY */}
      <p style={{
        color: "#4ade80",
        fontWeight: "bold",
        fontSize: 16,
        marginTop: 8
      }}>
        💰 ${final.toFixed(2)}
      </p>

      {/* 🔥 PRICE INPUT */}
      <div style={{ marginTop: 6 }}>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{
            width: "100%",
            padding: 6,
            background: "#0f172a",
            color: "white",
            border: "1px solid #334155",
            borderRadius: 6
          }}
        />
        <button
          onClick={updatePrice}
          style={{
            marginTop: 4,
            width: "100%",
            background: "#22c55e",
            color: "white",
            padding: 6,
            borderRadius: 6,
            border: "none"
          }}
        >
          Update Price
        </button>
      </div>

      {/* 🔥 NOTE */}
      <textarea
        placeholder="Reason / note..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{
          width: "100%",
          marginTop: 8,
          padding: 6,
          background: "#0f172a",
          color: "white",
          border: "1px solid #334155",
          borderRadius: 6
        }}
      />

      {/* APPROVAL */}
      {job.status === "payment_required" && (
        <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
          <button style={{ flex: 1, background: "#22c55e", color: "white", padding: 6, borderRadius: 6 }} onClick={approve}>
            ✅ Approve
          </button>
          <button style={{ flex: 1, background: "#ef4444", color: "white", padding: 6, borderRadius: 6 }} onClick={deny}>
            ❌ Deny
          </button>
        </div>
      )}

      {/* TRACKING */}
      {job.status === "shipping" && (
        <div style={{ marginTop: 6 }}>
          <input
            placeholder="Tracking #"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            style={{
              width: "100%",
              padding: 6,
              background: "#0f172a",
              color: "white",
              border: "1px solid #334155",
              borderRadius: 6
            }}
          />
          <button
            onClick={addTracking}
            style={{
              marginTop: 4,
              width: "100%",
              background: "#3b82f6",
              color: "white",
              padding: 6,
              borderRadius: 6
            }}
          >
            Ship
          </button>
        </div>
      )}

      {job.trackingNumber && (
        <p style={{ fontSize: 12 }}>📦 {job.trackingNumber}</p>
      )}

      {/* 🔥 PRO TIMELINE */}
      <div style={{ marginTop: 12 }}>
        <p style={{ fontWeight: "bold", fontSize: 13, color: "white" }}>
          🕒 Timeline
        </p>

        {(job.timeline || []).slice().reverse().map((t, i) => (
          <div
            key={i}
            style={{
              borderLeft: `3px solid ${statusColors[t.status] || "#64748b"}`,
              paddingLeft: 8,
              marginBottom: 8
            }}
          >
            <div style={{ fontSize: 12, color: "white" }}>
              <b style={{ color: statusColors[t.status] }}>
                {t.status}
              </b>
            </div>

            <div style={{ fontSize: 10, opacity: 0.7 }}>
              {formatDate(t.date)}
            </div>

            {t.note && (
              <div style={{
                fontSize: 12,
                color: "#38bdf8",
                marginTop: 2
              }}>
                💬 {t.note}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}