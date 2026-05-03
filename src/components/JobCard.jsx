import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

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
    data: {
      type: "card",
      job
    }
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

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <p><b>{job.customerName || "Guest"}</b></p>
      <p>Status: {job.status}</p>
    </div>
  )
}