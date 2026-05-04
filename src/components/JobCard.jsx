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
    data: { type: "card", job }
  })

  const [price, setPrice] = useState(job.finalPrice || 0)
  const [note, setNote] = useState("")

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: "#020617",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    border: "1px solid #1e293b",
    color: "#e5e7eb"
  }

  const inputStyle = {
    width: "100%",
    padding: "8px",
    background: "#020617",
    color: "#e5e7eb",
    border: "1px solid #334155",
    borderRadius: "6px",
    outline: "none"
  }

  /* ================= ACTIONS ================= */

  const updatePrice = async () => {
    try {
      await api.patch(`/orders/${job._id}/price`, {
        finalPrice: Number(price)
      })
    } catch (err) {
      console.error("❌ PRICE UPDATE ERROR:", err)
    }
  }

  const approve = async () => {
    try {
      await api.patch(`/orders/${job._id}/status`, {
        status: "ready_for_production",
        note
      })
    } catch (err) {
      console.error("❌ APPROVE ERROR:", err)
    }
  }

  const deny = async () => {
    try {
      await api.patch(`/orders/${job._id}/status`, {
        status: "denied",
        note
      })
    } catch (err) {
      console.error("❌ DENY ERROR:", err)
    }
  }

  const artworkUrl = job.artwork
    ? job.artwork.startsWith("http")
      ? job.artwork
      : `${API_URL}${job.artwork.startsWith("/uploads") ? "" : "/uploads/"}${job.artwork}`
    : null

  const latestNote =
    job.timeline?.[job.timeline.length - 1]?.note || ""

  return (
    <div ref={setNodeRef} style={style}>
      
      {/* DRAG HANDLE */}
      <div {...listeners} {...attributes} style={{ cursor: "grab", fontSize: 10, opacity: 0.5 }}>
        ⠿ drag
      </div>

      {/* CUSTOMER */}
      <p style={{ fontWeight: "bold", fontSize: 14 }}>
        {job.customerName || "Guest"}
      </p>

      {/* STATUS */}
      <p style={{ fontSize: 12, color: "#38bdf8" }}>
        {job.status}
      </p>

      {/* PRICE */}
      <p style={{
        color: "#22c55e",
        fontWeight: "bold",
        fontSize: "18px",
        marginTop: 6
      }}>
        💰 ${Number(job.finalPrice || 0).toFixed(2)}
      </p>

      {/* IMAGE PREVIEW */}
      {artworkUrl && (
        <>
          <img
            src={artworkUrl}
            alt="artwork"
            style={{
              width: "100%",
              height: 120,
              objectFit: "cover",
              borderRadius: 6,
              marginTop: 6
            }}
          />

          <a
            href={artworkUrl}
            download
            style={{
              display: "block",
              marginTop: 6,
              fontSize: 12,
              color: "#38bdf8"
            }}
          >
            ⬇ Download Artwork
          </a>
        </>
      )}

      {/* PRICE EDIT */}
      <div style={{ marginTop: 10 }}>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={inputStyle}
        />
        <button
          onClick={updatePrice}
          style={{
            marginTop: 6,
            width: "100%",
            background: "#2563eb",
            color: "white",
            padding: 6,
            borderRadius: 6
          }}
        >
          Update Price
        </button>
      </div>

      {/* NOTE */}
      <textarea
        placeholder="Reason / note..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{
          ...inputStyle,
          minHeight: 60,
          marginTop: 8
        }}
      />

      {/* APPROVAL */}
      {job.status === "payment_required" && (
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <button
            onClick={approve}
            style={{
              flex: 1,
              background: "#22c55e",
              color: "white",
              padding: 6,
              borderRadius: 6
            }}
          >
            Approve
          </button>

          <button
            onClick={deny}
            style={{
              flex: 1,
              background: "#ef4444",
              color: "white",
              padding: 6,
              borderRadius: 6
            }}
          >
            Deny
          </button>
        </div>
      )}

      {/* LAST NOTE DISPLAY */}
      {latestNote && (
        <div
          style={{
            marginTop: 10,
            padding: 8,
            background: "#111827",
            borderRadius: 6,
            fontSize: 12,
            color: "#cbd5f5"
          }}
        >
          💬 {latestNote}
        </div>
      )}

    </div>
  )
}