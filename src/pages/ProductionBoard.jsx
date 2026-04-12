import { useEffect, useState } from "react"
import api from "../services/api"
import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable
} from "@dnd-kit/core"
import { io } from "socket.io-client"

/* ================= SOCKET ================= */
const socket = io("https://signavi-backend.onrender.com")

/* ================= SOUND ================= */
const playSound = () => {
  const audio = new Audio("/notify.mp3")
  audio.volume = 0.5
  audio.play().catch(() => {})
}

/* ================= COLORS ================= */
const getColor = (status) => {
  switch (status) {
    case "pending": return "#334155"
    case "payment_required": return "#7c2d12"
    case "paid": return "#065f46"
    case "production": return "#1e40af"
    case "shipping": return "#065f46"
    case "shipped": return "#4c1d95"
    default: return "#1e293b"
  }
}

/* ================= DRAG CARD ================= */
function JobCard({ job }) {

  const isLocked =
    job.source === "quote" ||
    job.status === "payment_required"

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: job._id,
    disabled: isLocked // 🔥 LOCK DRAG
  })

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    padding: 10,
    marginBottom: 10,
    background: isLocked ? "#1e293b" : "#020617",
    borderRadius: 6,
    cursor: isLocked ? "not-allowed" : "grab",
    opacity: isLocked ? 0.6 : 1,
    border: "1px solid #334155"
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div style={{ fontWeight: "bold" }}>
        {job.customerName || "No Name"}
      </div>

      <div style={{ fontSize: 12, opacity: 0.7 }}>
        #{job._id?.slice(-6)}
      </div>

      {isLocked && (
        <div style={{ fontSize: 10, color: "#f87171" }}>
          🔒 Awaiting Payment
        </div>
      )}
    </div>
  )
}

/* ================= COLUMN ================= */
function Column({ status, jobs }) {
  const { setNodeRef } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: 240,
        maxWidth: 260,
        background: getColor(status),
        padding: 12,
        borderRadius: 8,
        flexShrink: 0
      }}
    >
      <h3 style={{ marginBottom: 10, textTransform: "capitalize" }}>
        {status}
      </h3>

      {(Array.isArray(jobs) ? jobs : []).map(job => (
        <JobCard key={job._id} job={job} />
      ))}
    </div>
  )
}

/* ================= MAIN ================= */
export default function ProductionBoard() {
  const [jobs, setJobs] = useState(null)

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/production")
        setJobs(res.data || {})
      } catch (err) {
        console.error("❌ LOAD FAILED:", err)
        setJobs({})
      }
    }

    load()
  }, [])

  /* ================= SOCKET ================= */
  useEffect(() => {
    socket.on("jobUpdated", (updatedJob) => {
      setJobs(prev => {
        const updated = { ...prev }

        for (const key in updated) {
          updated[key] = updated[key].filter(j => j._id !== updatedJob._id)
        }

        const status = updatedJob.status
        updated[status] = [...(updated[status] || []), updatedJob]

        return updated
      })
    })

    return () => socket.off("jobUpdated")
  }, [])

  /* ================= DRAG ================= */
  const handleDragEnd = async ({ active, over }) => {
    if (!active?.id || !over?.id) return

    const jobId = active.id
    const newStatus = over.id

    let movedJob = null

    // 🔍 find job
    for (const key in jobs) {
      const found = jobs[key]?.find(j => j._id === jobId)
      if (found) {
        movedJob = found
        break
      }
    }

    // 🚫 BLOCK QUOTES
    if (movedJob?.source === "quote") {
      console.warn("🚫 Cannot move quotes")
      return
    }

    // 🚫 BLOCK UNPAID
    if (movedJob?.status === "payment_required") {
      console.warn("🚫 Payment required")
      return
    }

    console.log("🔥 DRAGGING:", jobId, "→", newStatus)

    try {
      await api.patch(`/orders/update-status/${jobId}`, {
        status: newStatus
      })

      playSound()

    } catch (err) {
      console.error("❌ DRAG ERROR:", err.response?.data || err.message)
    }
  }

  /* ================= LOADING ================= */
  if (!jobs) {
    return (
      <div style={{
        background: "#020617",
        color: "white",
        minHeight: "100vh",
        padding: 40
      }}>
        ⏳ Loading Production Board...
      </div>
    )
  }

  /* ================= UI ================= */
  return (
    <div style={{
      padding: 20,
      background: "#020617",
      minHeight: "100vh",
      color: "white"
    }}>
      <h1 style={{ marginBottom: 20 }}>
        🏭 Production Board
      </h1>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          alignItems: "flex-start"
        }}>
          {Object.entries(jobs).map(([status, list]) => (
            <Column key={status} status={status} jobs={list} />
          ))}
        </div>
      </DndContext>
    </div>
  )
}