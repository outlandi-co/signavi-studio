import { useDroppable } from "@dnd-kit/core"
import JobCard from "./JobCard" // adjust path if needed

export function Column({ id, jobs = [], updateStatus }) {

  const { setNodeRef, isOver } = useDroppable({ id })

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
        <JobCard
          key={job._id}
          job={job}
          updateStatus={updateStatus}
        />
      ))}

    </div>
  )
}