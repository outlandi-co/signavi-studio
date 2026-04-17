import { useEffect, useState } from "react"
import api from "../services/api"
import {
  DndContext,
  closestCenter,
  useDroppable
} from "@dnd-kit/core"
import { io } from "socket.io-client"
import JobCard from "../components/JobCard" // ✅ USE YOUR REAL CARD

/* ================= SOCKET ================= */
const socket = io("https://signavi-backend.onrender.com")

/* ================= COLORS ================= */
const getColor = (status) => {
  switch (status) {
    case "quotes": return "#1e293b"
    case "pending": return "#334155"
    case "payment_required": return "#7c2d12"
    case "paid": return "#065f46"
    case "production": return "#1e40af"
    case "shipping": return "#065f46"
    case "shipped": return "#4c1d95"
    default: return "#1e293b"
  }
}

/* ================= COLUMN ================= */
function Column({ status, jobs }) {
  const { setNodeRef } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: 260,
        background: getColor(status),
        padding: 12,
        borderRadius: 10
      }}
    >
      <h3 style={{ marginBottom: 10 }}>
        {status.toUpperCase()}
      </h3>

      {jobs.map(job => (
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
      const res = await api.get("/production")
      setJobs(res.data || {})
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

        const status = updatedJob.status || "quotes"
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

    for (const key in jobs) {
      const found = jobs[key]?.find(j => j._id === jobId)
      if (found) {
        movedJob = found
        break
      }
    }

    /* 🚫 BLOCK QUOTES ONLY */
    if (movedJob?.source === "quote") {
      console.warn("🚫 Cannot move quotes")
      return
    }

    try {
      await api.patch(`/orders/update-status/${jobId}`, {
        status: newStatus
      })
    } catch (err) {
      console.error("❌ DRAG ERROR:", err)
    }
  }

  if (!jobs) return <p style={{ color: "white" }}>Loading...</p>

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
          flexWrap: "wrap"
        }}>
          {Object.entries(jobs).map(([status, list]) => (
            <Column key={status} status={status} jobs={list} />
          ))}
        </div>
      </DndContext>
    </div>
  )
}