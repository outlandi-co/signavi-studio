import { useDroppable } from "@dnd-kit/core"

/* ================= COLUMN ================= */
export default function Column({ id, jobs, onClick }) {
  const { setNodeRef, isOver } = useDroppable({
    id
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        minHeight: "600px", // 🔥 IMPORTANT FOR DROP DETECTION
        padding: "10px",
        borderRadius: "10px",
        border: isOver ? "2px solid #3b82f6" : "1px dashed #1e293b",
        background: "#020617",
        transition: "0.2s"
      }}
    >
      <h3 style={{ color: "white", marginBottom: 10 }}>
        {id.toUpperCase()}
      </h3>

      {(jobs || []).map(job => (
        <div
          key={job._id}
          style={{ marginBottom: "10px" }}
          onClick={() => onClick(job)}
        >
          {/* your Card component still wraps this */}
          {job.customerName}
        </div>
      ))}
    </div>
  )
}