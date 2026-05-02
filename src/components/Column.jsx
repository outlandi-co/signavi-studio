import { useDroppable } from "@dnd-kit/core"
import JobCard from "./JobCard"

/* 🔥 ADD THIS */
const getColor = (status) => {
  switch (status) {
    case "quotes": return "#1e293b"
    case "payment_required": return "#7c2d12"
    case "ready_for_production": return "#78350f"
    case "production": return "#1e40af"
    case "shipping": return "#065f46"
    case "shipped": return "#4c1d95"
    default: return "#1e293b"
  }
}

export function Column({ id, jobs }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "column",
      columnId: id
    }
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: 260,
        minHeight: 300,
        background: getColor(id),
        padding: 12,
        borderRadius: 10,
        border: isOver ? "2px solid #3b82f6" : "1px solid #1e293b"
      }}
    >
      <h3>{id.toUpperCase()}</h3>

      {(jobs || []).map(job => (
        <JobCard key={job._id} job={job} />
      ))}
    </div>
  )
}