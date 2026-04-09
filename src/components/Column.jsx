import { useDroppable } from "@dnd-kit/core"
import api from "../../services/api"

export function Column({ id, jobs = [], onClick }) {

  const { setNodeRef, isOver } = useDroppable({ id })

  const handleDelete = async (event, jobId) => {
    event.stopPropagation()

    if (!window.confirm("Delete this order?")) return

    try {
      await api.delete(`/orders/${jobId}`)
      window.location.reload()
    } catch (err) {
      console.error(err)
      alert("Delete failed")
    }
  }

  const handleCardClick = (event, job) => {
    event.stopPropagation()

    if (typeof onClick === "function") {
      onClick(job)
    } else {
      console.error("❌ Column onClick is not a function:", onClick)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        minHeight: "600px",
        padding: "10px",
        borderRadius: "10px",
        border: isOver ? "2px solid #3b82f6" : "1px dashed #1e293b",
        background: "#020617"
      }}
    >
      <h3 style={{ color: "white" }}>{id.toUpperCase()}</h3>

      {jobs.map(job => (
        <div
          key={job._id}
          onClick={(e) => handleCardClick(e, job)}
          style={{
            background: "#020617",
            border: "1px solid #1e293b",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "10px",
            cursor: "pointer"
          }}
        >
          <p style={{ color: "white" }}>
            <strong>{job.customerName || "Unknown"}</strong>
          </p>

          <p style={{ color: "#94a3b8" }}>Status: {job.status}</p>
          <p style={{ color: "#94a3b8" }}>Qty: {job.quantity}</p>
          <p style={{ color: "#22c55e" }}>
            ${job.finalPrice || job.price || 0}
          </p>

          <button
            onClick={(e) => handleDelete(e, job._id)}
            style={{
              marginTop: "8px",
              background: "red",
              color: "white",
              border: "none",
              padding: "6px 10px",
              cursor: "pointer"
            }}
          >
            DELETE
          </button>
        </div>
      ))}
    </div>
  )
}