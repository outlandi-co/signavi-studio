import { useDroppable } from "@dnd-kit/core"

import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"

import { CSS } from "@dnd-kit/utilities"

const formatStatus = (value = "") => {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const getTotal = (job = {}) => {
  return Number(
    job.finalPrice ||
      job.total ||
      job.price ||
      job.subtotal ||
      0
  )
}

const getPriorityStyle = (priority = "medium") => {
  if (priority === "high") {
    return {
      background: "rgba(239,68,68,0.14)",
      border: "1px solid rgba(239,68,68,0.45)",
      color: "#fca5a5"
    }
  }

  if (priority === "low") {
    return {
      background: "rgba(34,197,94,0.14)",
      border: "1px solid rgba(34,197,94,0.45)",
      color: "#86efac"
    }
  }

  return {
    background: "rgba(250,204,21,0.14)",
    border: "1px solid rgba(250,204,21,0.45)",
    color: "#fde68a"
  }
}

const isOverdue = (dueDate) => {
  if (!dueDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  return due < today
}

/* ================= JOB CARD ================= */

function JobCard({
  job,
  onOpen
}) {
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
      type: "job",
      job
    }
  })

  const overdue =
    isOverdue(job.dueDate)

  const priorityStyle =
    getPriorityStyle(job.priority)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    padding: 14,
    marginBottom: 12,
    background: "#020617",
    border: isDragging
      ? "1px solid #22d3ee"
      : "1px solid #1e293b",
    borderRadius: 16,
    cursor: "grab",
    color: "white",
    boxShadow: isDragging
      ? "0 18px 40px rgba(34,211,238,0.18)"
      : "0 10px 25px rgba(0,0,0,0.25)"
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onDoubleClick={() => onOpen?.(job)}
    >
      <div style={cardHeader}>
        <div>
          <p style={orderId}>
            #
            {String(job.orderId || job._id || "")
              .slice(-6)
              .toUpperCase()}
          </p>

          <h4 style={customerName}>
            {job.customerName || "Guest"}
          </h4>

          <p style={emailText}>
            {job.email || "No email"}
          </p>
        </div>

        <strong style={totalText}>
          {money(getTotal(job))}
        </strong>
      </div>

      <div style={metaRow}>
        <span style={statusBadge}>
          {formatStatus(job.status)}
        </span>

        {job.priority && (
          <span style={priorityStyle}>
            {formatStatus(job.priority)}
          </span>
        )}

        {overdue && (
          <span style={overdueBadge}>
            Overdue
          </span>
        )}
      </div>

      {job.dueDate && (
        <p style={smallText}>
          Due: {new Date(job.dueDate).toLocaleDateString()}
        </p>
      )}

      {job.items?.length > 0 && (
        <div style={itemsBox}>
          {job.items.slice(0, 3).map((item, index) => (
            <p
              key={`${item.name || "item"}-${index}`}
              style={itemText}
            >
              {item.name || "Item"} x{item.quantity || 1}
            </p>
          ))}

          {job.items.length > 3 && (
            <p style={itemText}>
              +{job.items.length - 3} more item(s)
            </p>
          )}
        </div>
      )}

      {job.adminNotes && (
        <p style={notesText}>
          📝 {job.adminNotes}
        </p>
      )}
    </article>
  )
}

/* ================= COLUMN ================= */

export function Column({
  id,
  jobs = [],
  title,
  onOpen
}) {
  const {
    setNodeRef,
    isOver
  } = useDroppable({
    id,
    data: {
      type: "column",
      columnId: id
    }
  })

  const columnRevenue = jobs.reduce(
    (sum, job) => sum + getTotal(job),
    0
  )

  const label =
    title ||
    formatStatus(id)

  return (
    <section
      ref={setNodeRef}
      style={{
        width: 320,
        minHeight: 500,
        background: isOver
          ? "#172554"
          : "#0f172a",
        padding: 16,
        borderRadius: 22,
        border: isOver
          ? "1px solid #38bdf8"
          : "1px solid #1e293b",
        transition: "0.2s",
        flexShrink: 0,
        boxShadow: "0 16px 40px rgba(0,0,0,0.28)"
      }}
    >
      <div style={columnHeader}>
        <div>
          <h3 style={columnTitle}>
            {label}
            <span style={countText}>
              {" "}({jobs.length})
            </span>
          </h3>

          <p style={revenueText}>
            {money(columnRevenue)}
          </p>
        </div>
      </div>

      <SortableContext
        items={jobs.map((job) => job._id)}
        strategy={verticalListSortingStrategy}
      >
        {jobs.length === 0 ? (
          <p style={emptyText}>
            No jobs in this column
          </p>
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onOpen={onOpen}
            />
          ))
        )}
      </SortableContext>
    </section>
  )
}

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start"
}

const orderId = {
  margin: 0,
  color: "#67e8f9",
  fontSize: 12,
  fontWeight: 900
}

const customerName = {
  margin: "4px 0 0",
  fontSize: 15,
  fontWeight: 900
}

const emailText = {
  margin: "4px 0 0",
  color: "#94a3b8",
  fontSize: 12
}

const totalText = {
  color: "#22c55e",
  fontSize: 13
}

const metaRow = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 12
}

const statusBadge = {
  border: "1px solid rgba(34,211,238,0.4)",
  background: "rgba(34,211,238,0.12)",
  color: "#67e8f9",
  borderRadius: 999,
  padding: "4px 8px",
  fontSize: 11,
  fontWeight: 900
}

const overdueBadge = {
  border: "1px solid rgba(239,68,68,0.45)",
  background: "rgba(239,68,68,0.14)",
  color: "#fca5a5",
  borderRadius: 999,
  padding: "4px 8px",
  fontSize: 11,
  fontWeight: 900
}

const smallText = {
  margin: "10px 0 0",
  color: "#cbd5e1",
  fontSize: 12
}

const itemsBox = {
  marginTop: 12,
  borderTop: "1px solid #1e293b",
  paddingTop: 10
}

const itemText = {
  margin: "3px 0",
  color: "#94a3b8",
  fontSize: 12
}

const notesText = {
  margin: "10px 0 0",
  color: "#cbd5e1",
  fontSize: 12,
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 10,
  padding: 8
}

const columnHeader = {
  marginBottom: 16,
  paddingBottom: 12,
  borderBottom: "1px solid #1e293b"
}

const columnTitle = {
  color: "white",
  fontSize: 16,
  fontWeight: 900,
  margin: 0
}

const countText = {
  color: "#67e8f9"
}

const revenueText = {
  margin: "8px 0 0",
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 800
}

const emptyText = {
  color: "#64748b",
  fontSize: 14,
  margin: 0
}