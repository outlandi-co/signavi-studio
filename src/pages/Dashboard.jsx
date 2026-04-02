

import { useEffect, useState, useCallback } from "react"
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

function DraggableJob({ job }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: job._id,
      data: job
    })

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    background: isDragging ? "#1e293b" : "#0f172a",
    padding: "12px",
    marginBottom: "10px",
    borderRadius: "8px",
    cursor: "grab",
    opacity: isDragging ? 0.6 : 1,
    transition: "all 0.2s ease"
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>

      <strong>{job.customerName}</strong>
      <p>{job.printType || "printing"}</p>
      <p style={{ opacity: 0.5 }}>#{job._id.slice(-6)}</p>

      {/* ================= SHIPPING UI ================= */}
      {job.status === "shipped" && (
        <div style={{
          marginTop: "10px",
          padding: "10px",
          background: "#020617",
          borderRadius: "6px"
        }}>

          {job.trackingNumber && (
            <p style={{ fontSize: "12px" }}>
              📦 Tracking: {job.trackingNumber}
            </p>
          )}

          {job.trackingLink && (
            <a
              href={job.trackingLink}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "block",
                fontSize: "12px",
                color: "#38bdf8",
                marginTop: "5px"
              }}
            >
              🔗 Track Package
            </a>
          )}

          {job.shippingLabel && (
            <a
              href={job.shippingLabel}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "block",
                marginTop: "8px",
                background: "#22c55e",
                color: "black",
                padding: "6px",
                borderRadius: "4px",
                textAlign: "center",
                fontSize: "12px",
                fontWeight: "bold"
              }}
            >
              🏷️ Print Label
            </a>
          )}

        </div>
      )}

    </div>
  )
}

/* ================= DROPPABLE ================= */

function Column({ status, jobs }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        background: isOver ? "#020617cc" : "#020617",
        padding: "15px",
        borderRadius: "12px",
        border: `2px solid ${COLORS[status]}`,
        transition: "all 0.2s ease"
      }}
    >
      <h2 style={{
        textAlign: "center",
        color: COLORS[status]
      }}>
        {status.toUpperCase()} ({jobs.length})
      </h2>

      {jobs.map(job => (
        <DraggableJob key={job._id} job={job} />
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

  const [loading, setLoading] = useState(true)

  /* 🔊 OPTIONAL SOUND */
  const playMoveSound = () => {
    const audio = new Audio("/sounds/move.mp3")
    audio.play().catch(() => {})
  }

  /* ✅ FETCH */
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

  useEffect(() => {

    const socket = io(SOCKET_URL)

    fetchJobs()

    socket.on("jobCreated", fetchJobs)
    socket.on("jobUpdated", fetchJobs)
    socket.on("jobDeleted", fetchJobs)

    return () => socket.disconnect()

  }, [fetchJobs])

  /* 🔥 OPTIMISTIC UPDATE */
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

  /* 🔥 DRAG END */
  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (!over) return

    const jobId = active.id
    const newStatus = over.id

    if (newStatus === "archive") {
      console.warn("Archive is locked")
      return
    }

    moveJobLocally(jobId, newStatus)
    playMoveSound()

    try {
      await api.patch(`/orders/${jobId}/status`, {
        status: newStatus
      })
    } catch (err) {
      console.error("❌ Failed update:", err)
      fetchJobs()
    }
  }

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
          />
        ))}
      </div>
    </DndContext>
  )
}

export default Dashboard