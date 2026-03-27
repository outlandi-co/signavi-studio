import { useEffect, useState, useRef } from "react"
import api from "../services/api"
import { io } from "socket.io-client"
import {
  DndContext,
  rectIntersection,
  useDraggable,
  useDroppable
} from "@dnd-kit/core"
import JobModal from "../components/modals/JobModal"
import ApprovalModal from "../components/modals/ApprovalModal"
import toast from "react-hot-toast"
import SalesDashboard from "../components/SalesDashboard"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api"
const SOCKET_URL = API_URL.replace("/api", "").replace(/\/$/, "")

/* ================= STATUS COLORS ================= */
const statusColors = {
  pending: "#facc15",
  approved: "#22c55e",
  artwork_sent: "#a855f7",
  printing: "#3b82f6",
  ready: "#06b6d4",
  shipping: "#f97316",
  shipped: "#10b981",
  denied: "#ef4444"
}

/* ================= STATUS RULES ================= */
const allowedMoves = {
  pending: ["approved", "denied"],
  approved: ["artwork_sent", "printing"],
  artwork_sent: ["approved", "printing"],
  printing: ["ready"],
  ready: ["shipping"],
  shipping: ["shipped"],
  shipped: [],
  denied: []
}

/* ================= CARD ================= */
function Card({ job, onClick }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: job._id
  })

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined
  }

  const color = statusColors[job.status] || "#334155"

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: "#020617",
        padding: "12px",
        borderRadius: "12px",
        color: "white",
        border: `1px solid ${color}`,
        boxShadow: `0 0 10px ${color}`,
        marginBottom: "10px"
      }}
    >
      <div {...listeners} {...attributes} style={{ cursor: "grab", fontSize: "10px", opacity: 0.5 }}>
        ⠿ drag
      </div>

      <div onClick={() => onClick(job)} style={{ cursor: "pointer" }}>
        <strong>{job.customerName}</strong>

        <div style={{ fontSize: "12px", opacity: 0.7, marginTop: "4px" }}>
          Order #{job?._id?.slice(-6) || "----"}
        </div>

        {job?.finalPrice && (
          <p style={{ fontSize: "12px", fontWeight: "bold", color: "#22c55e", marginTop: "2px" }}>
            💰 ${job.finalPrice}
          </p>
        )}

        <p style={{ color }}>{job.status}</p>

        {job.items && job.items.length > 0 && (
          <div style={{ marginTop: "6px", fontSize: "11px", opacity: 0.8 }}>
            {job.items.slice(0, 2).map((item, i) => (
              <div key={i}>
                • {item.name} x{item.quantity}
              </div>
            ))}

            {job.items.length > 2 && (
              <div style={{ opacity: 0.5 }}>
                +{job.items.length - 2} more
              </div>
            )}
          </div>
        )}
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
        padding: "12px",
        minHeight: "500px",
        background: isOver ? "#0f172a" : "#020617",
        borderRadius: "12px",
        transition: "0.2s"
      }}
    >
      <h3 style={{ color: "white" }}>{id.toUpperCase()}</h3>

      {(jobs || []).map(job => (
        <Card key={job._id} job={job} onClick={onClick} />
      ))}
    </div>
  )
}

/* ================= MAIN ================= */
function ProductionBoard() {
  const [jobs, setJobs] = useState({})
  const [selectedJob, setSelectedJob] = useState(null)
  const [approvalJob, setApprovalJob] = useState(null)

  const socketRef = useRef(null)

  /* 🔥 FAST LOOKUP (BIG FIX) */
  const findJobStatus = (jobId) => {
    for (const [status, list] of Object.entries(jobs)) {
      if (list.find(j => j._id === jobId)) {
        return status
      }
    }
    return null
  }

  const updateJobInState = (updatedJob) => {
    setJobs(prev => {
      const newState = { ...prev }

      Object.keys(newState).forEach(status => {
        newState[status] = newState[status].filter(
          j => j._id !== updatedJob._id
        )
      })

      const newStatus = updatedJob.status || "pending"

      if (!newState[newStatus]) {
        newState[newStatus] = []
      }

      newState[newStatus].unshift(updatedJob)

      return newState
    })
  }

  const fetchJobs = async () => {
    try {
      const res = await api.get("/production")
      setJobs(res.data || {})
    } catch (err) {
      console.error("❌ FETCH ERROR:", err)
      toast.error("Failed to load jobs")
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over) return

    const jobId = active.id
    const newStatus = over.id

    const currentStatus = findJobStatus(jobId)

    if (!allowedMoves[currentStatus]?.includes(newStatus)) {
      toast.error("Invalid move")
      return
    }

    try {
      const res = await api.patch(`/orders/${jobId}/status`, {
        status: newStatus
      })

      updateJobInState(res.data)

    } catch (err) {
      console.error("❌ DRAG ERROR:", err)
      toast.error("Update failed")
    }
  }

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const res = await api.get("/production")
        if (!mounted) return
        setJobs(res.data || {})
      } catch (err) {
        console.error("❌ INIT ERROR:", err)
      }
    }

    init()

    /* 🔥 SOCKET FIX (NO DUPLICATES) */
    if (!socketRef.current) {
      const socket = io(SOCKET_URL, { transports: ["websocket"] })
      socketRef.current = socket

      socket.off("jobUpdated")
      socket.on("jobUpdated", fetchJobs)
    }

    return () => {
      mounted = false
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [])

  const handleClick = (job) => {
    if (job.source === "quote" && job.approvalStatus === "pending") {
      setApprovalJob(job)
      return
    }

    setSelectedJob(job)
  }

  return (
    <div style={{ padding: "20px", background: "#020617", minHeight: "100vh" }}>

      <SalesDashboard />

      <h2 style={{ color: "white" }}>Production Dashboard</h2>

      <DndContext collisionDetection={rectIntersection} onDragEnd={handleDragEnd}>
        <div style={{ display: "flex", gap: "20px" }}>
          {Object.entries(jobs).map(([key, value]) => (
            <Column key={key} id={key} jobs={value} onClick={handleClick} />
          ))}
        </div>
      </DndContext>

      {approvalJob && (
        <ApprovalModal
          job={approvalJob}
          onClose={() => setApprovalJob(null)}
          refresh={updateJobInState}
        />
      )}

      {selectedJob && (
        <JobModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          refresh={updateJobInState}
        />
      )}
    </div>
  )
}

export default ProductionBoard