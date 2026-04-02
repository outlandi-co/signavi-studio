import { useEffect, useState, useCallback, useRef } from "react"
import { io } from "socket.io-client"
import api from "../services/api"
import {
  DndContext,
  useDraggable,
  useDroppable
} from "@dnd-kit/core"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api"
const SOCKET_URL = API_URL.replace("/api", "").replace(/\/$/, "")

const STATUS_COLUMNS = [
  "pending",
  "payment_required",
  "production",
  "shipped",
  "archive",
  "denied"
]

const COLORS = {
  pending: "#facc15",
  payment_required: "#22c55e",
  production: "#fb923c",
  shipped: "#38bdf8",
  archive: "#64748b",
  denied: "#ef4444"
}

/* ================= DRAGGABLE ================= */

function DraggableJob({ job, selected, toggleSelect }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: job._id,
      data: job
    })

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    background: selected ? "#22c55e33" : "#0f172a",
    padding: "12px",
    marginBottom: "10px",
    borderRadius: "8px",
    cursor: "grab",
    border: selected ? "2px solid #22c55e" : "none",
    opacity: isDragging ? 0.6 : 1
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>

      <div onClick={() => toggleSelect(job._id)}>
        <strong>{job.customerName}</strong>
        <p>{job.printType || "printing"}</p>
        <p style={{ opacity: 0.5 }}>#{job._id.slice(-6)}</p>
      </div>

      {/* SHIPPING UI */}
      {job.status === "shipped" && (
        <div style={{
          marginTop: "10px",
          padding: "10px",
          background: "#020617",
          borderRadius: "6px"
        }}>

          {job.trackingNumber && (
            <p style={{ fontSize: "12px" }}>
              📦 {job.trackingNumber}
            </p>
          )}

          {job.trackingLink && (
            <a
              href={job.trackingLink}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: "12px", color: "#38bdf8" }}
            >
              🔗 Track
            </a>
          )}

          {job.shippingLabel && (
            <button
              onClick={() => window.open(job.shippingLabel, "_blank")}
              style={{
                marginTop: "6px",
                width: "100%",
                background: "#22c55e",
                color: "black",
                padding: "6px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "bold"
              }}
            >
              🖨️ Print Label
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ================= COLUMN ================= */

function Column({ status, jobs, selectedJobs, toggleSelect }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        background: isOver ? "#020617cc" : "#020617",
        padding: "15px",
        borderRadius: "12px",
        border: `2px solid ${COLORS[status]}`
      }}
    >
      <h2 style={{ textAlign: "center", color: COLORS[status] }}>
        {status.toUpperCase()} ({jobs.length})
      </h2>

      {jobs.map(job => (
        <DraggableJob
          key={job._id}
          job={job}
          selected={selectedJobs.includes(job._id)}
          toggleSelect={toggleSelect}
        />
      ))}
    </div>
  )
}

/* ================= MAIN ================= */

function Dashboard() {

  const [jobs, setJobs] = useState({
    pending: [],
    payment_required: [],
    production: [],
    shipped: [],
    archive: [],
    denied: []
  })

  const [selectedJobs, setSelectedJobs] = useState([])
  const [loading, setLoading] = useState(true)

  const openedLabels = useRef(new Set())

  /* ================= FETCH ================= */

  const fetchJobs = useCallback(async () => {
    try {
      const res = await api.get("/production")
      setJobs(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  /* ================= SOCKET ================= */

  useEffect(() => {

    const socket = io(SOCKET_URL)

    socket.on("jobUpdated", (updatedOrder) => {

      if (
        updatedOrder.status === "shipped" &&
        updatedOrder.shippingLabel &&
        !openedLabels.current.has(updatedOrder._id)
      ) {
        openedLabels.current.add(updatedOrder._id)
        window.open(updatedOrder.shippingLabel, "_blank")
      }

      fetchJobs()
    })

    socket.on("jobCreated", fetchJobs)
    socket.on("jobDeleted", fetchJobs)

    return () => socket.disconnect()

  }, [fetchJobs])

  /* ================= SELECT ================= */

  const toggleSelect = (id) => {
    setSelectedJobs(prev =>
      prev.includes(id)
        ? prev.filter(j => j !== id)
        : [...prev, id]
    )
  }

  /* ================= LOCAL MOVE ================= */

  const moveJobLocally = (jobId, newStatus) => {
    const newState = { ...jobs }
    let movedJob = null

    for (const key of STATUS_COLUMNS) {
      newState[key] = newState[key].filter(j => {
        if (j._id === jobId) {
          movedJob = j
          return false
        }
        return true
      })
    }

    if (movedJob) {
      movedJob.status = newStatus
      newState[newStatus].unshift(movedJob)
    }

    setJobs(newState)
  }

  /* ================= DRAG END ================= */

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over) return

    const newStatus = over.id

    const batch = selectedJobs.length ? selectedJobs : [active.id]

    for (const jobId of batch) {

      moveJobLocally(jobId, newStatus)

      try {
        const res = await api.patch(`/orders/${jobId}/status`, {
          status: newStatus
        })

        const updatedOrder = res.data.order

        if (
          updatedOrder.status === "shipped" &&
          updatedOrder.shippingLabel
        ) {
          window.open(updatedOrder.shippingLabel, "_blank")
        }

      } catch (err) {
        console.error(err)
        fetchJobs()
      }
    }

    setSelectedJobs([])
  }

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div style={{
        padding: 40,
        background: "#020617",
        color: "white",
        height: "100vh"
      }}>
        Loading Dashboard...
      </div>
    )
  }

  /* ================= UI ================= */

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div style={{
        display: "flex",
        gap: "15px",
        padding: "20px",
        height: "100vh",
        background: "#020617",
        color: "white"
      }}>
        {STATUS_COLUMNS.map(status => (
          <Column
            key={status}
            status={status}
            jobs={jobs[status] || []}
            selectedJobs={selectedJobs}
            toggleSelect={toggleSelect}
          />
        ))}
      </div>
    </DndContext>
  )
}

export default Dashboard