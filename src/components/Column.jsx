import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import JobCard from "./JobCard"

export function Column({ id, jobs }) {
  const { setNodeRef } = useDroppable({
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
        minHeight: 400,
        padding: 12,
        borderRadius: 10,
        background: "#0f172a",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <h3>{id}</h3>

      <SortableContext
        items={(jobs || []).map(j => j._id)}
        strategy={verticalListSortingStrategy}
      >
        {(jobs || []).map(job => (
          <JobCard key={job._id} job={job} />
        ))}
      </SortableContext>
    </div>
  )
}