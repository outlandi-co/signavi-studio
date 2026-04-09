import { useEffect, useState, useRef, useCallback } from "react"
import api from "../services/api"
import { io } from "socket.io-client"
import { DndContext, closestCenter } from "@dnd-kit/core"
import JobModal from "../components/modals/JobModal"
import toast from "react-hot-toast"

import NotificationPanel from "../components/NotificationPanel"

import {
  Column,
  SummaryBar
} from "../components/ProductionUI"

const API_URL = import.meta.env.VITE_API_URL || "https://signavi-backend.onrender.com/api"
const SOCKET_URL = API_URL.replace("/api", "")

const normalizeStatus = (job) => {
  if (!job) return "pending"
  if (job.status === "paid") return "production"
  return job.status || "pending"
}

export default function ProductionBoard() {

  const [jobs, setJobs] = useState({})
  const [selectedJob, setSelectedJob] = useState(null)

  const socketRef = useRef(null)
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

  /* ================= DELETE ================= */
  const handleDeleteJob = (id) => {
    setJobs(prev => {
      const updated = {}

      Object.keys(prev).forEach(key => {
        updated[key] = prev[key].filter(j => j._id !== id)
      })

      return updated
    })
  }

  /* ================= SAFE SELECT (🔥 FIX) ================= */
  const handleSelectJob = (job) => {
    if (!job) return

    setSelectedJob(job)
  }

  /* ================= SOCKET ================= */
  useEffect(() => {

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"],
        reconnection: true
      })
    }

    const socket = socketRef.current

    const handleUpdate = (updatedOrder) => {
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
    }

    const handleCreate = (job) => {
      setJobs(prev => {
        const updated = { ...prev }

        const status = normalizeStatus(job)

        if (!updated[status]) updated[status] = []
        updated[status].unshift(job)

        return updated
      })
    }

    const handleDelete = (id) => {
      handleDeleteJob(id)
    }

    socket.on("jobUpdated", handleUpdate)
    socket.on("jobCreated", handleCreate)
    socket.on("jobDeleted", handleDelete)

    return () => {
      socket.off("jobUpdated", handleUpdate)
      socket.off("jobCreated", handleCreate)
      socket.off("jobDeleted", handleDelete)
    }

  }, [])

  /* ================= DRAG ================= */
  const handleDragEnd = async ({ active, over }) => {
    if (!over) return

    const jobId = active.id
    const newStatus = over.id

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
    <div style={{
      padding: 20,
      background: "#020617",
      minHeight: "100vh"
    }}>

      <NotificationPanel onSelectJob={handleSelectJob} />

      <h1 style={{ color: "white" }}>🏭 Production Board</h1>

      <SummaryBar jobs={jobs} />

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div style={{
          display: "flex",
          gap: 20,
          marginTop: 20,
          overflowX: "auto",
          paddingBottom: 10
        }}>
          {Object.entries(jobs).map(([key, value]) => (
            <Column
              key={key}
              id={key}
              jobs={value}

              /* 🔥 SAFE HANDLER */
              onClick={handleSelectJob}

              onDelete={handleDeleteJob}
            />
          ))}
        </div>
      </DndContext>

      {selectedJob && (
        <JobModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}

    </div>
  )
}