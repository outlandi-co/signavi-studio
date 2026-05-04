import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import api from "../services/api"

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    background: "#020617",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    border: "1px solid #1e293b",
    color: "white",
    cursor: "grab"
  }

  /* 🔥 FIXED APPROVE */
  const approve = async (e) => {
    e.stopPropagation()

    await api.patch(`/orders/${job._id}/status`, {
      status: "ready_for_production"
    })
  }

  const deny = async (e) => {
    e.stopPropagation()

    await api.patch(`/orders/${job._id}/status`, {
      status: "denied"
    })
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <p><b>{job.customerName || "Guest"}</b></p>
      <p>Status: {job.status}</p>

      {job.finalPrice > 0 && (
        <p style={{ color: "#22c55e" }}>💰 ${job.finalPrice}</p>
      )}

      {/* APPROVAL */}
      {job.status === "quotes" && (
        <div style={{ marginTop: 8 }}>
          <button onClick={approve}>Approve</button>
          <button onClick={deny}>Deny</button>
        </div>
      )}
    </div>
  )
}