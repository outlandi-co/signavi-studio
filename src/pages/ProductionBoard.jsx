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
    case "production": return "#1e40af"
    case "shipping": return "#065f46"
    case "shipped": return "#4c1d95"
    default: return "#1e293b"
  }
}

/* ================= DRAG CARD ================= */
function JobCard({ job }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: job._id
  })

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    padding: 10,
    marginBottom: 10,
    background: "#020617",
    borderRadius: 6,
    cursor: "grab",
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
    </div>
  )
}

/* ================= COLUMN ================= */
function Column({ status, jobs }) {
  const { setNodeRef } = useDroppable({
    id: status
  })

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
    let isMounted = true

    const load = async () => {
      try {
        const res = await api.get("/production")

        if (!isMounted) return

        setJobs(
          res?.data && typeof res.data === "object"
            ? res.data
            : {}
        )

      } catch (err) {
        console.error("❌ LOAD FAILED:", err)
        if (isMounted) setJobs({})
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  /* ================= SOCKET LIVE ================= */
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

    // ⚡ instant UI update
    setJobs(prev => {
      const updated = { ...prev }

      let movedJob = null

      for (const key in updated) {
        updated[key] = updated[key].filter(job => {
          if (job._id === jobId) {
            movedJob = job
            return false
          }
          return true
        })
      }

      if (movedJob) {
        movedJob.status = newStatus
        updated[newStatus] = [...(updated[newStatus] || []), movedJob]
      }

      return updated
    })

    try {
      await api.patch(`/orders/update-status/${jobId}`, {
        status: newStatus
      })

      playSound()

    } catch (err) {
      console.error("❌ DRAG ERROR:", err)
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
            <Column
              key={status}
              status={status}
              jobs={list}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}