import { useEffect, useState, useRef, useCallback } from "react"
import api from "../services/api"
import { io } from "socket.io-client"
import { DndContext, closestCenter, useDraggable, useDroppable } from "@dnd-kit/core"
import JobModal from "../components/modals/JobModal"
import ApprovalModal from "../components/modals/ApprovalModal"
import toast from "react-hot-toast"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api"
const SOCKET_URL = API_URL.replace("/api", "").replace(/\/$/, "")

/* ================= STATUS COLORS ================= */
const statusColors = {
  pending: "#facc15",
  approved: "#22c55e",
  printing: "#3b82f6",
  shipping: "#f97316",
  shipped: "#10b981",
  denied: "#ef4444"
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

        <p style={{ fontSize: "12px", opacity: 0.7 }}>
          Order #{job._id.slice(-6)}
        </p>

        <p style={{ color }}>{job.status}</p>

        {(job.price > 0 || job.finalPrice > 0) && (
          <div style={{ marginTop: "6px", fontSize: "12px" }}>
            {job.price > 0 && <p>💰 Price: ${job.price}</p>}
            {job.shippingCost > 0 && <p>🚚 Shipping: ${job.shippingCost}</p>}
            {job.finalPrice > 0 && (
              <p style={{ color: "#22c55e", fontWeight: "bold" }}>
                Total: ${job.finalPrice}
              </p>
            )}
          </div>
        )}

        {job.trackingNumber && (
          <p style={{ color: "#22c55e", fontSize: "11px" }}>
            📦 {job.trackingNumber}
          </p>
        )}
      </div>
    </div>
  )
}

/* ================= COLUMN ================= */
function Column({ id, jobs, onClick }) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div ref={setNodeRef} style={{ flex: 1, padding: "12px" }}>
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

  /* 🔥 STABLE FETCH FUNCTION */
  const loadJobs = useCallback(async () => {
    try {
      const res = await api.get("/production")
      console.log("📦 FETCHED JOBS:", res.data)
      setJobs(res.data || {})
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    // 🔥 INITIAL LOAD (FIXED)
    const init = async () => {
      await loadJobs()
    }

    init()

    // 🔥 SOCKET SETUP
    if (!socketRef.current) {
      const socket = io(SOCKET_URL, { transports: ["websocket"] })
      socketRef.current = socket

      socket.on("connect", () => {
        console.log("🟢 SOCKET CONNECTED")
      })

      socket.on("jobUpdated", () => {
        console.log("🔄 JOB UPDATED")
        loadJobs()
        toast.success("Updated")
      })
    }

    return () => {
      socketRef.current?.disconnect()
    }

  }, [loadJobs])

  const handleClick = (job) => {
    if (job.source === "quote" && job.approvalStatus === "pending") {
      setApprovalJob(job)
      return
    }

    setSelectedJob(job)
  }

  return (
    <div style={{ padding: "20px", background: "#020617", minHeight: "100vh" }}>
      <h2 style={{ color: "white" }}>Production Dashboard</h2>

      <DndContext collisionDetection={closestCenter}>
        <div style={{ display: "flex", gap: "20px" }}>
          {Object.entries(jobs).map(([key, value]) => (
            <Column key={key} id={key} jobs={value} onClick={handleClick} />
          ))}
        </div>
      </DndContext>

      {approvalJob && (
        <ApprovalModal job={approvalJob} onClose={() => setApprovalJob(null)} refresh={loadJobs} />
      )}

      {selectedJob && (
        <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} refresh={loadJobs} />
      )}
    </div>
  )
}

export default ProductionBoard