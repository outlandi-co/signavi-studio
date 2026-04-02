import { useEffect, useState, useRef } from "react"
import api from "../services/api"
import { io } from "socket.io-client"
import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  PointerSensor
} from "@dnd-kit/core"
import JobModal from "../components/modals/JobModal"
import ApprovalModal from "../components/modals/ApprovalModal"
import toast from "react-hot-toast"

/* ================= STATUS COLORS ================= */
const statusColors = {
  pending: "#facc15",
  payment_required: "#22c55e",
  production: "#3b82f6",
  shipped: "#10b981",
  denied: "#ef4444",
  archive: "#64748b"
}

/* ================= NORMALIZER ================= */
const normalizeJobs = (data = {}) => ({
  pending: data.pending || [],
  payment_required: data.payment_required || [],
  production: data.production || [],
  shipped: data.shipped || [],
  denied: data.denied || [],
  archive: data.archive || []
})

/* ================= CARD ================= */
function Card({ job, onClick }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: job._id
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : "none",
        background: "#020617",
        padding: "12px",
        borderRadius: "12px",
        color: "white",
        border: `1px solid ${statusColors[job.status]}`,
        marginBottom: "10px"
      }}
    >
      <div {...listeners} {...attributes} style={{ cursor: "grab" }}>
        ⠿
      </div>

      <div onClick={() => onClick(job)}>
        <strong>{job.customerName}</strong>
        <p>#{job._id.slice(-6)}</p>
        <p>{job.status}</p>
      </div>
    </div>
  )
}

/* ================= COLUMN ================= */
function Column({ id, jobs, onClick }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        minHeight: "500px",
        padding: "10px",
        border: isOver ? "2px solid #3b82f6" : "1px dashed #1e293b",
        borderRadius: "10px",
        background: "#020617"
      }}
    >
      <h3 style={{ color: "white" }}>{id.toUpperCase()}</h3>

      {(jobs || []).map(j => (
        <Card key={j._id} job={j} onClick={onClick} />
      ))}
    </div>
  )
}

/* ================= METRICS ================= */
function Metrics({ jobs }) {
  const all = Object.values(jobs).flat()

  const revenue = all.reduce((sum, j) => sum + (j.finalPrice || 0), 0)
  const orders = all.length

  const today = all.filter(j => {
    const d = new Date(j.createdAt)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  }).length

  return (
    <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
      <MetricBox title="Revenue" value={`$${revenue}`} color="#22c55e" />
      <MetricBox title="Orders" value={orders} color="#3b82f6" />
      <MetricBox title="Today" value={today} color="#f59e0b" />
    </div>
  )
}

function MetricBox({ title, value, color }) {
  return (
    <div
      style={{
        flex: 1,
        background: "#020617",
        padding: 20,
        borderRadius: 12,
        border: `1px solid ${color}`,
        color: "white"
      }}
    >
      <h4>{title}</h4>
      <h2>{value}</h2>
    </div>
  )
}

/* ================= MAIN ================= */
function ProductionBoard() {
  const [jobs, setJobs] = useState({})
  const [selectedJob, setSelectedJob] = useState(null)

  const socketRef = useRef(null)
  const sensors = useSensors(useSensor(PointerSensor))

  /* LOAD */
  useEffect(() => {
    const load = async () => {
      const res = await api.get("/production")
      setJobs(normalizeJobs(res.data))
    }
    load()
  }, [])

  /* SOCKET */
  useEffect(() => {
    socketRef.current = io("http://localhost:5050")

    socketRef.current.on("jobUpdated", async () => {
      const res = await api.get("/production")
      setJobs(normalizeJobs(res.data))
    })

    return () => socketRef.current.disconnect()
  }, [])

  /* DRAG */
  const handleDragEnd = async ({ active, over }) => {
    if (!over) return

    const jobId = active.id
    const newStatus = over.id === "production" ? "paid" : over.id

    try {
      await api.patch(`/orders/${jobId}/status`, {
        status: newStatus
      })
    } catch {
      toast.error("Update failed")
    }
  }

  return (
    <div style={{ padding: 20, background: "#020617", minHeight: "100vh" }}>
      
      {/* 🔥 MERGED DASHBOARD */}
      <Metrics jobs={jobs} />

      {/* 🔥 KANBAN */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: "flex", gap: 20 }}>
          {Object.entries(jobs).map(([k, v]) => (
            <Column key={k} id={k} jobs={v} onClick={setSelectedJob} />
          ))}
        </div>
      </DndContext>

      {selectedJob && (
        <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  )
}

export default ProductionBoard