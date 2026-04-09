import { useMemo, useState } from "react"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import api from "../services/api"

/* ================= PROFIT COLORS ================= */
const getProfitColor = (profit) => {
  if (profit >= 100) return "#22c55e"
  if (profit >= 40) return "#eab308"
  return "#ef4444"
}

/* ================= CARD ================= */
export function Card({ job, onClick, onDelete }) {

  const [deleting, setDeleting] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: job._id
  })

  const profitColor = getProfitColor(job.profit || 0)

  const handleDelete = async (e) => {
  e.stopPropagation()

  if (!window.confirm("Delete this item?")) return

  try {
    setDeleting(true)

    let endpoint = ""

    switch (job.source) {
      case "order":
        endpoint = `/orders/${job._id}`
        break

      case "quote":
        endpoint = `/quotes/${job._id}`
        break

      default:
        throw new Error("Unknown job source")
    }

    await api.delete(endpoint)

    onDelete?.(job._id)

  } catch (err) {
    console.error("❌ DELETE ERROR:", err.response?.data || err.message)
    alert("Delete failed")
  } finally {
    setDeleting(false)
  }
}

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        border: `1px solid ${profitColor}`,
        padding: "10px",
        borderRadius: "10px",
        background: "#020617",
        marginBottom: "10px",
        position: "relative"
      }}
    >

      {/* DELETE */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        style={{
          position: "absolute",
          top: 6,
          right: 6,
          background: deleting ? "#6b7280" : "#ef4444",
          color: "white",
          border: "none",
          padding: "4px 8px",
          fontSize: "12px",
          cursor: deleting ? "not-allowed" : "pointer",
          borderRadius: "4px"
        }}
      >
        {deleting ? "..." : "Delete"}
      </button>

      {/* DRAG HANDLE */}
      <div {...listeners} {...attributes} style={{ cursor: "grab" }}>
        ⠿
      </div>

      {/* CONTENT */}
      <div onClick={() => onClick?.(job)} style={{ cursor: "pointer" }}>
        <strong>{job.customerName || "Unknown"}</strong>
        <p>#{job._id.slice(-6)}</p>
        <p>{job.status}</p>
      </div>

    </div>
  )
}

/* ================= COLUMN ================= */
export function Column({ id, jobs = [], onClick, onDelete }) {

  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        minWidth: 260,
        padding: 10,
        background: isOver ? "#0f172a" : "#020617",
        borderRadius: 10,
        border: isOver
          ? "2px dashed #38bdf8"
          : "1px solid #1e293b"
      }}
    >
      <h3 style={{ color: "white", marginBottom: 10 }}>
        {id.toUpperCase()}
      </h3>

      {jobs.map(j => (
        <Card
          key={j._id}
          job={j}
          onClick={onClick}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

/* ================= SUMMARY ================= */
export function SummaryBar({ jobs = {} }) {

  const summary = useMemo(() => {
    const all = Object.values(jobs).flat()

    let revenue = 0
    let profit = 0

    all.forEach(j => {
      revenue += j.estimated || 0
      profit += j.profit || 0
    })

    return { revenue, profit, count: all.length }
  }, [jobs])

  return (
    <div style={{
      display: "flex",
      gap: 20,
      color: "white",
      marginBottom: 10
    }}>
      <div>💵 Revenue: ${summary.revenue.toFixed(2)}</div>
      <div>📈 Profit: ${summary.profit.toFixed(2)}</div>
      <div>📦 Jobs: {summary.count}</div>
    </div>
  )
}

/* ================= PROFIT ALERTS ================= */
export function ProfitAlerts({ jobs = {} }) {

  const alerts = useMemo(() => {
    const all = Object.values(jobs).flat()
    return all.filter(j => (j.profit || 0) < 20)
  }, [jobs])

  if (alerts.length === 0) return null

  return (
    <div style={{
      background: "#1e293b",
      padding: 12,
      borderRadius: 8,
      marginBottom: 10,
      border: "1px solid #ef4444"
    }}>
      <strong style={{ color: "#ef4444" }}>
        ⚠️ Low Profit Jobs
      </strong>

      <ul style={{ marginTop: 8 }}>
        {alerts.map(j => (
          <li key={j._id}>
            #{j._id.slice(-6)} → ${j.profit || 0}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ================= TOP JOBS ================= */
export function TopJobs({ jobs = {} }) {

  const top = useMemo(() => {
    const all = Object.values(jobs).flat()

    return all
      .sort((a, b) => (b.profit || 0) - (a.profit || 0))
      .slice(0, 5)
  }, [jobs])

  if (top.length === 0) return null

  return (
    <div style={{
      background: "#020617",
      padding: 12,
      borderRadius: 8,
      marginBottom: 10,
      border: "1px solid #22c55e"
    }}>
      <strong style={{ color: "#22c55e" }}>
        🏆 Top Profit Jobs
      </strong>

      <ul style={{ marginTop: 8 }}>
        {top.map(j => (
          <li key={j._id}>
            #{j._id.slice(-6)} → ${j.profit || 0}
          </li>
        ))}
      </ul>
    </div>
  )
}