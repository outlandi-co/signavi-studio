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

  /* ================= DETECT TYPE ================= */
  const isQuote =
    job.source === "quote" || job.status === "quotes"

  /* ================= STATE ================= */
  const [price, setPrice] = useState(job.finalPrice || 0)
  const [note, setNote] = useState("")

  /* ================= STYLE ================= */
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

  /* ================= ACTIONS ================= */

  const updateQuote = async () => {
    try {
      await api.patch(`/orders/${job._id}`, {
        finalPrice: Number(price),
        note
      })
      console.log("✅ Quote updated")
    } catch (err) {
      console.error("❌ UPDATE ERROR:", err)
    }
  }

  const approve = async () => {
    try {
      await api.patch(`/orders/${job._id}`, {
        status: "payment_required",
        finalPrice: Number(price),
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

  return (
    <div ref={setNodeRef} style={style}>

      {/* DRAG HANDLE */}
      <div {...listeners} {...attributes} style={{ cursor: "grab", fontSize: 10 }}>
        ⠿ drag
      </div>

      {/* CUSTOMER */}
      <p><b>{job.customerName || "Guest"}</b></p>

      {/* STATUS */}
      <p style={{ color: "#38bdf8" }}>{job.status}</p>

      {/* PRICE DISPLAY */}
      <p style={{ color: "#22c55e", fontWeight: "bold" }}>
        💰 ${Number(job.finalPrice || 0).toFixed(2)}
      </p>

      {/* 🔥 QUOTE ONLY CONTROLS */}
      {isQuote && (
        <>
          {/* PRICE INPUT */}
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

          {/* NOTE INPUT */}
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

          {/* SAVE BUTTON */}
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

          {/* APPROVE / DENY */}
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