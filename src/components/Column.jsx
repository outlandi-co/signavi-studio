import { useDroppable } from "@dnd-kit/core"
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

function JobCard({ job }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id: job._id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: 10,
    marginBottom: 10,
    background: "#1e293b",
    borderRadius: 6,
    cursor: "grab"
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {job.customerName || "Job"}
    </div>
  )
}

export function Column({ id, jobs }) {
  const { setNodeRef } = useDroppable({
    id: id,
    data: {
      type: "column",
      columnId: id
    }
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        width: 250,
        minHeight: 400,
        background: "#0f172a",
        padding: 10,
        borderRadius: 8
      }}
    >
      <h3 style={{ marginBottom: 10 }}>{id}</h3>

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