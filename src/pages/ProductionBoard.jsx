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

const SOCKET_URL = "http://localhost:5050"

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

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    load()
  }, [load])

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

        /* remove from all columns */
        Object.keys(updated).forEach(key => {
          updated[key] = updated[key].filter(j => j._id !== updatedOrder._id)
        })

        /* add to new column */
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
      setJobs(prev => {
        const updated = { ...prev }

        Object.keys(updated).forEach(key => {
          updated[key] = updated[key].filter(j => j._id !== id)
        })

        return updated
      })
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

    try {
      await api.patch(`/orders/${active.id}/status`, {
        status: over.id
      })

      toast.success("Status updated")

    } catch (err) {
      console.error(err)
      toast.error("Failed to update")
    }
  }

  return (
    <div style={{
      padding: 20,
      background: "#020617",
      minHeight: "100vh"
    }}>

      {/* 🔔 Notifications */}
      <NotificationPanel onSelectJob={setSelectedJob} />

      <h1 style={{ color: "white" }}>🏭 Production Board</h1>

      {/* 📊 Summary stays (optional but useful) */}
      <SummaryBar jobs={jobs} />

      {/* 🚫 REMOVED ANALYTICS (moved to Revenue page) */}

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
              onClick={setSelectedJob}
            />
          ))}
        </div>
      </DndContext>

      {/* 🔥 Modal */}
      {selectedJob && (
        <JobModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}

    </div>
  )
}