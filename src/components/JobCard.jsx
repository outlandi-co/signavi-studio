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
      await api.patch(`/orders/${job._id}/status`, {
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
      await api.patch(`/orders/${job._id}/status`, {
        status: "denied",
        note
      })
      window.location.reload()
    } catch (err) {
      console.error("❌ DENY ERROR:", err)
    }
  }

  const addTracking = async () => {
    if (!tracking) return

    try {
      await api.patch(`/orders/${job._id}/status`, {
        status: "shipping",
        trackingNumber: tracking
      })
      window.location.reload()
    } catch (err) {
      console.error("❌ TRACKING ERROR:", err)
    }
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

      <p><b>{job.customerName || "Guest"}</b></p>
      <p style={{ fontSize: 12 }}>{job.status}</p>

      {/* ARTWORK */}
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
        <a href={artworkUrl} download style={{ fontSize: 12 }}>
          ⬇ Download
        </a>
      )}

      {/* 💰 INLINE PRICE */}
      <div style={{ marginTop: 8 }}>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ width: "100%", padding: 4 }}
        />
        <button onClick={updatePrice}>Update Price</button>
      </div>

      {/* 💬 COMMENT */}
      <textarea
        placeholder="Reason / note to customer..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ width: "100%", marginTop: 6 }}
      />

      {/* ✅ APPROVAL */}
      {job.status === "payment_required" && (
        <div style={{ marginTop: 6 }}>
          <button onClick={approve}>✅ Approve</button>
          <button onClick={deny}>❌ Deny</button>
        </div>
      )}

      {/* 🚚 TRACKING */}
      {job.status === "shipping" && (
        <div style={{ marginTop: 6 }}>
          <input
            placeholder="Tracking #"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
          />
          <button onClick={addTracking}>Ship</button>
        </div>
      )}

      {job.trackingNumber && <p>📦 {job.trackingNumber}</p>}
    </div>
  )
}