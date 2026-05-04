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

  /* ================= ACTIONS ================= */

  const updatePrice = async () => {
    try {
      await api.patch(`/orders/${job._id}`, {
        finalPrice: Number(price)
      })
    } catch (err) {
      console.error("❌ PRICE ERROR:", err)
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

  /* ================= SHOW BUTTON LOGIC ================= */

  const showDecisionButtons =
    job.status === "payment_required" ||
    job.status === "quotes"

  return (
    <div ref={setNodeRef} style={style}>

      <div {...listeners} {...attributes} style={{ cursor: "grab", fontSize: 10 }}>
        ⠿ drag
      </div>

      <p><b>{job.customerName || "Guest"}</b></p>
      <p style={{ color: "#38bdf8" }}>{job.status}</p>

      <p style={{ color: "#22c55e", fontWeight: "bold" }}>
        💰 ${Number(job.finalPrice || 0).toFixed(2)}
      </p>

      {/* PRICE */}
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        style={{
          width: "100%",
          marginTop: 6,
          padding: 6,
          background: "#020617",
          color: "#fff",
          border: "1px solid #334155"
        }}
      />

      <button
        onClick={updatePrice}
        style={{
          width: "100%",
          marginTop: 6,
          background: "#2563eb",
          color: "white",
          padding: 6
        }}
      >
        Update Price
      </button>

      {/* NOTE */}
      <textarea
        placeholder="Reason / note..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{
          width: "100%",
          marginTop: 6,
          padding: 6,
          background: "#020617",
          color: "#fff"
        }}
      />

      {/* 🔥 APPROVE / DENY */}
      {showDecisionButtons && (
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <button
            onClick={approve}
            style={{
              flex: 1,
              background: "#22c55e",
              color: "white",
              padding: 6
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
              padding: 6
            }}
          >
            Deny
          </button>
        </div>
      )}

    </div>
  )
}