import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState } from "react"
import api from "../services/api"

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

  const isQuote = job.status === "quotes"

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

  /* 🔥 ROUTE SWITCH */
  const endpoint = isQuote
    ? `/quotes/${job._id}`
    : `/orders/${job._id}`

  /* ================= ACTIONS ================= */

  const updateQuote = async () => {
    try {
      await api.patch(endpoint, {
        price: Number(price),
        note
      })
      console.log("✅ Quote updated")
    } catch (err) {
      console.error("❌ UPDATE ERROR:", err.response?.data || err.message)
    }
  }

  const approve = async () => {
    try {
      await api.patch(endpoint, {
        status: "approved",
        price: Number(price),
        note
      })
      window.location.reload()
    } catch (err) {
      console.error("❌ APPROVE ERROR:", err.response?.data || err.message)
    }
  }

  const deny = async () => {
    try {
      await api.patch(endpoint, {
        status: "denied",
        note
      })
      window.location.reload()
    } catch (err) {
      console.error("❌ DENY ERROR:", err.response?.data || err.message)
    }
  }

  return (
    <div ref={setNodeRef} style={style}>

      {/* DRAG */}
      <div {...listeners} {...attributes} style={{ cursor: "grab", fontSize: 10 }}>
        ⠿ drag
      </div>

      <p><b>{job.customerName || "Guest"}</b></p>
      <p style={{ color: "#38bdf8" }}>{job.status}</p>

      <p style={{ color: "#22c55e", fontWeight: "bold" }}>
        💰 ${Number(job.finalPrice || 0).toFixed(2)}
      </p>

      {/* 🔥 QUOTE ONLY UI */}
      {isQuote && (
        <>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Adjust price"
            style={{
              width: "100%",
              marginTop: 6,
              padding: 6,
              background: "#020617",
              color: "#fff",
              border: "1px solid #334155",
              borderRadius: 6
            }}
          />

          <textarea
            placeholder="Reason / comment..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              width: "100%",
              marginTop: 6,
              padding: 6,
              background: "#020617",
              color: "#fff",
              border: "1px solid #334155",
              borderRadius: 6
            }}
          />

          <button
            onClick={updateQuote}
            style={{
              width: "100%",
              marginTop: 6,
              background: "#2563eb",
              color: "white",
              padding: 6,
              borderRadius: 6
            }}
          >
            Save Quote
          </button>

          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
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
        </>
      )}

    </div>
  )
}