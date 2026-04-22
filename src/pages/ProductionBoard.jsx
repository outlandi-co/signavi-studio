import { useEffect, useState, useRef } from "react"
import api from "../services/api"
import { DndContext, useDroppable } from "@dnd-kit/core"
import { io } from "socket.io-client"
import JobCard from "../components/JobCard"

const getColor = (status) => {
  switch (status) {
    case "quotes": return "#1e293b"
    case "payment_required": return "#7c2d12"
    case "production": return "#1e40af"
    case "shipping": return "#065f46"
    case "shipped": return "#4c1d95"
    default: return "#1e293b"
  }
}

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
      <h3>{status.toUpperCase()}</h3>

      {(jobs || []).map(job => (
        <JobCard key={job._id} job={job} />
      ))}
    </div>
  )
}

export default function ProductionBoard() {
  const [jobs, setJobs] = useState(null)

  // 🔥 SOCKET REF (prevents duplicates)
  const socketRef = useRef(null)

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/production")

        // 🔥 ensure all columns exist
        const safeData = {
          quotes: [],
          payment_required: [],
          production: [],
          shipping: [],
          shipped: [],
          ...res.data
        }

        setJobs(safeData)
      } catch (err) {
        console.error(err)
        setJobs({
          quotes: [],
          payment_required: [],
          production: [],
          shipping: [],
          shipped: []
        })
      }
    }

    load()
  }, [])

  /* ================= SOCKET ================= */
  useEffect(() => {
    socketRef.current = io("https://signavi-backend.onrender.com")

    const handleJobUpdated = (updatedJob) => {
      setJobs(prev => {
        if (!prev) return prev

        const updated = {}

        // remove from all columns
        for (const key in prev) {
          updated[key] = (prev[key] || []).filter(
            j => j._id !== updatedJob._id
          )
        }

        // normalize status
        let column = updatedJob.status || "quotes"

        if (column === "paid") {
          column = "production"
        }

        if (!updated[column]) updated[column] = []

        updated[column].push(updatedJob)

        return updated
      })
    }

    socketRef.current.on("jobUpdated", handleJobUpdated)

    return () => {
      socketRef.current.off("jobUpdated", handleJobUpdated)
      socketRef.current.disconnect()
    }
  }, [])

  /* ================= DRAG ================= */
  const handleDragEnd = async ({ active, over }) => {
    if (!active?.id || !over?.id || !jobs) return

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

    // 🚫 prevent dragging quotes
    if (movedJob?.source === "quote") return

    // 🚫 prevent same column update
    if (movedJob?.status === newStatus) return

    try {
      await api.patch(`/orders/update-status/${jobId}`, {
        status: newStatus
      })
    } catch (err) {
      console.error(err)
    }
  }

  if (!jobs) return <div>Loading...</div>

  return (
    <div
      style={{
        padding: 20,
        background: "#020617",
        minHeight: "100vh",
        color: "white"
      }}
    >
      <h1>🏭 Production Board</h1>

      <DndContext onDragEnd={handleDragEnd}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {Object.entries(jobs).map(([status, list]) => (
            <Column key={status} status={status} jobs={list} />
          ))}
        </div>
      </DndContext>
    </div>
  )
}