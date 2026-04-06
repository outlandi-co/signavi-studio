import { useMemo } from "react"
import { useDraggable, useDroppable } from "@dnd-kit/core"

/* ================= PROFIT COLORS ================= */
const getProfitColor = (profit) => {
  if (profit >= 100) return "#22c55e"
  if (profit >= 40) return "#eab308"
  return "#ef4444"
}

/* ================= CARD ================= */
export function Card({ job, onClick }) {

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

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : "none",
        transition: "transform 0.2s ease",
        border: `1px solid ${profitColor}`,
        boxShadow: isDragging
          ? `0 10px 25px ${profitColor}80`
          : `0 0 10px ${profitColor}40`,
        padding: "10px",
        borderRadius: "10px",
        background: "#020617",
        marginBottom: "10px",
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 1000 : 1
      }}
    >

      {/* DRAG HANDLE */}
      <div {...listeners} {...attributes} style={{ cursor: "grab" }}>
        ⠿
      </div>

      {/* CONTENT */}
      <div onClick={() => onClick(job)} style={{ cursor: "pointer" }}>
        <strong>{job.customerName}</strong>
        <p>#{job._id.slice(-6)}</p>
        <p>{job.status}</p>

        <div style={{ fontSize: 12 }}>
          💰 ${job.estimated?.toFixed(2) || "0.00"}  
          📈 ${job.profit?.toFixed(2) || "0.00"}
        </div>

        <div style={{ fontSize: 11, color: profitColor }}>
          {job.profit >= 100 && "🔥 High Profit"}
          {job.profit >= 40 && job.profit < 100 && "⚡ Good"}
          {job.profit < 40 && "⚠️ Low"}
        </div>
      </div>

    </div>
  )
}

/* ================= COLUMN ================= */
export function Column({ id, jobs, onClick }) {

  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        padding: 10,
        background: isOver ? "#0f172a" : "#020617",
        borderRadius: 10,
        border: isOver
          ? "2px dashed #38bdf8"
          : "1px solid #1e293b",
        transition: "0.2s"
      }}
    >

      <h3 style={{
        marginBottom: 10,
        color: "white"
      }}>
        {id.toUpperCase()}
      </h3>

      {(jobs || []).map(j => (
        <Card key={j._id} job={j} onClick={onClick} />
      ))}

    </div>
  )
}

/* ================= SUMMARY ================= */
export function SummaryBar({ jobs }) {

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
      marginBottom: 20,
      color: "white"
    }}>
      <div>💵 ${summary.revenue.toFixed(2)}</div>
      <div>📈 ${summary.profit.toFixed(2)}</div>
      <div>📦 {summary.count} jobs</div>
    </div>
  )
}

/* ================= TOP JOBS ================= */
export function TopJobs({ jobs, onSelectJob }) {

  const topJobs = Object.values(jobs)
    .flat()
    .sort((a, b) => (b.profit || 0) - (a.profit || 0))
    .slice(0, 5)

  if (!topJobs.length) return null

  return (
    <div style={{
      marginBottom: 20,
      background: "#020617",
      padding: 15,
      borderRadius: 12,
      border: "1px solid #1e293b",
      color: "white"
    }}>
      <h3 style={{ marginBottom: 10 }}>🏆 Top Profit Jobs</h3>

      {topJobs.map((job, index) => {
        const profit = job.profit || 0

        return (
          <div
            key={job._id}
            onClick={() => onSelectJob?.(job)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "1px solid #1e293b",
              cursor: "pointer"
            }}
          >
            <span>
              {index + 1}. {job.customerName}
            </span>

            <span style={{
              color: profit >= 100
                ? "#22c55e"
                : profit >= 40
                  ? "#eab308"
                  : "#ef4444"
            }}>
              ${profit.toFixed(2)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ================= ALERTS ================= */
export function ProfitAlerts({ jobs, onSelectJob }) {

  const allJobs = Object.values(jobs).flat()

  const low = allJobs.filter(j => (j.profit || 0) < 30)
  const high = allJobs.filter(j => (j.profit || 0) >= 100)

  if (!low.length && !high.length) return null

  return (
    <div style={{
      marginBottom: 20,
      padding: 15,
      borderRadius: 12,
      background: "#020617",
      border: "1px solid #1e293b",
      color: "white"
    }}>
      <h3 style={{ marginBottom: 10 }}>🚨 Alerts</h3>

      {low.length > 0 && (
        <div
          onClick={() => onSelectJob?.(low[0])}
          style={{ color: "#ef4444", cursor: "pointer" }}
        >
          ⚠️ {low.length} low-profit job(s)
        </div>
      )}

      {high.length > 0 && (
        <div
          onClick={() => onSelectJob?.(high[0])}
          style={{ color: "#22c55e", cursor: "pointer" }}
        >
          🔥 {high.length} high-profit job(s)
        </div>
      )}
    </div>
  )
}