import { useDroppable } from "@dnd-kit/core"
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

/* ================= JOB CARD ================= */
function JobCard({ job }) {
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
    padding: 10,
    marginBottom: 10,
    background: "#1e293b",
    borderRadius: 6,
    cursor: "grab",
    color: "white"
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <p><b>{job.customerName || "Guest"}</b></p>
      <p style={{ fontSize: 12, opacity: 0.7 }}>{job.status}</p>
    </div>
  )
}

/* ================= COLUMN ================= */
export function Column({ id, jobs }) {
  const { setNodeRef, isOver } = useDroppable({
    id
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        width: 260,
        minHeight: 400,
        background: isOver ? "#1e293b" : "#0f172a",
        padding: 10,
        borderRadius: 10,
        transition: "0.2s"
      }}
    >
      <h3 style={{ color: "white", marginBottom: 10 }}>
        {id}
      </h3>

      <SortableContext
        items={jobs.map(j => j._id)}
        strategy={verticalListSortingStrategy}
      >
        {jobs.map(job => (
          <JobCard key={job._id} job={job} />
        ))}
      </SortableContext>
    </div>
  )
}