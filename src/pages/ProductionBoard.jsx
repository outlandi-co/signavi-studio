import { useEffect, useState, useRef, useCallback } from "react"
import api from "../services/api"
import { DndContext, closestCenter } from "@dnd-kit/core"
import JobModal from "../components/modals/JobModal"
import toast from "react-hot-toast"

import NotificationPanel from "../components/NotificationPanel"
import { Column, SummaryBar } from "../components/ProductionUI"

// ✅ NEW SOCKET SERVICE
import { getSocket } from "../services/socket"

const normalizeStatus = (job) => {
  if (!job) return "pending"
  if (job.status === "paid") return "production"
  return job.status || "pending"
}

export default function ProductionBoard() {
  const [jobs, setJobs] = useState({})
  const [selectedJob, setSelectedJob] = useState(null)

  const loadingRef = useRef(false)

  /* ================= LOAD ================= */
  const load = useCallback(async () => {
    if (loadingRef.current) return

    try {
      loadingRef.current = true
      const res = await api.get("/production")
      setJobs(res.data)
    } catch (err) {
      console.error("❌ LOAD ERROR:", err)
    } finally {
      loadingRef.current = false
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  /* ================= SOCKET ================= */
  useEffect(() => {
    let socket

    const init = async () => {
      socket = await getSocket()

      if (!socket) return

      socket.on("jobUpdated", (updatedOrder) => {
        setJobs(prev => {
          const updated = { ...prev }

          Object.keys(updated).forEach(key => {
            updated[key] = updated[key].filter(j => j._id !== updatedOrder._id)
          })

          const status = normalizeStatus(updatedOrder)

          if (!updated[status]) updated[status] = []
          updated[status].unshift(updatedOrder)

          return updated
        })
      })
    }

    init()

    return () => {
      socket?.off("jobUpdated")
    }
  }, [])

  /* ================= DRAG ================= */
  const handleDragEnd = async ({ active, over }) => {
    if (!over) return

    const jobId = active.id
    const newStatus = over.id

    if (!jobId) {
      console.error("❌ NO JOB ID FOUND")
      return
    }

    console.log("🔥 DRAGGING JOB ID:", jobId)

    const previousJobs = structuredClone(jobs)

    setJobs(prev => {
      const updated = { ...prev }
      let movedJob = null

      Object.keys(updated).forEach(key => {
        updated[key] = updated[key].filter(j => {
          if (j._id === jobId) {
            movedJob = { ...j, status: newStatus }
            return false
          }
          return true
        })
      })

      if (!updated[newStatus]) updated[newStatus] = []
      updated[newStatus].unshift(movedJob)

      return updated
    })

    try {
      await api.patch(`/orders/${jobId}/status`, {
        status: newStatus
      })
    } catch (err) {
      console.error("❌ STATUS UPDATE FAILED:", err)
      setJobs(previousJobs)
      toast.error("Update failed — reverted")
    }
  }

  return (
    <div style={{ padding: 20, background: "#020617", minHeight: "100vh" }}>
      <NotificationPanel onSelectJob={setSelectedJob} />

      <h1 style={{ color: "white" }}>🏭 Production Board</h1>

      <SummaryBar jobs={jobs} />

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
          {Object.entries(jobs).map(([key, value]) => (
            <Column
              key={key}
              id={key}
              jobs={value}
              onClick={setSelectedJob}
            />
          ))}
        </div>
      </DndContext>

      {selectedJob && (
        <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  )
}