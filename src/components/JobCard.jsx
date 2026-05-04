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
    transition
  } = useSortable({
    id: job._id,
    data: { type: "card", job }
  })

  const [price, setPrice] = useState(job.finalPrice || 0)
  const [note, setNote] = useState("")

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
    borderRadius: "6px"
  }

  /* ================= ACTIONS ================= */

  const updatePrice = async () => {
    try {
      await api.patch(`/orders/${job._id}`, {
        finalPrice: Number(price)
      })
    } catch (err) {
      console.error("❌ PRICE UPDATE ERROR:", err)
    }
  }

  const approve = async () => {
    try {
      await api.patch(`/orders/${job._id}`, {
        status: "ready_for_production",
        note
      })
      window.location.reload()
    } catch (err) {
      console.error("❌ APPROVE ERROR:", err)
    }
  }

  const deny = async () => {
    try {
      await api.patch(`/orders/${job._id}`, {
        status: "denied",
        note
      })
      window.location.reload()
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

      <p style={{ fontWeight: "bold" }}>
        {job.customerName || "Guest"}
      </p>

      <p style={{ fontSize: 12, color: "#38bdf8" }}>
        {job.status}
      </p>

      <p style={{
        color: "#22c55e",
        fontWeight: "bold",
        fontSize: "18px",
        marginTop: 6
      }}>
        💰 ${Number(job.finalPrice || 0).toFixed(2)}
      </p>

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

          <a href={artworkUrl} download style={{ fontSize: 12, color: "#38bdf8" }}>
            ⬇ Download Artwork
          </a>
        </>
      )}

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

      {/* 🔥 FIXED APPROVE/DENY */}
      {["payment_required", "quotes"].includes(job.status) && (
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

      {latestNote && (
        <div
          style={{
            marginTop: 10,
            padding: 8,
            background: "#111827",
            borderRadius: 6,
            fontSize: 12
          }}
        >
          💬 {latestNote}
        </div>
      )}

    </div>
  )
}