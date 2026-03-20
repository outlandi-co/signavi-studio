import { useEffect, useState } from "react"
import api from "../services/api"
import { io } from "socket.io-client"

import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable
} from "@dnd-kit/core"

/* ✅ SAFE API URL */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050"

/* ================= CARD ================= */
function DraggableCard({ job, onOpen }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: job._id
  })

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined
  }

  const imageUrl = job?.artwork
    ? `${API_URL}/uploads/${job.artwork}`
    : null

  const statusColor = {
    pending: "#facc15",
    printing: "#38bdf8",
    ready: "#22c55e",
    shipping: "#fb923c",
    shipped: "#a78bfa",
    delivered: "#10b981"
  }

  const saveTracking = async (tracking) => {
    if (!tracking) return

    const endpoint =
      job.type === "quote"
        ? `/quotes/${job._id}/tracking`
        : `/orders/${job._id}/tracking`

    try {
      await api.patch(endpoint, { trackingNumber: tracking })
    } catch (err) {
      console.error("Tracking error:", err)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: "#fff",
        borderRadius: "12px",
        padding: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
      }}
      {...attributes}
    >
      {/* DRAG HANDLE */}
      <div {...listeners} style={{ cursor: "grab" }}>
        <div
          onClick={(e) => {
            e.stopPropagation()
            onOpen(job)
          }}
          style={{ cursor: "pointer" }}
        >
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Artwork"
              style={{
                width: "100%",
                height: "120px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "8px"
              }}
            />
          )}

          <p style={{ fontSize: "12px", color: "#06b6d4" }}>
            {job.type === "quote" ? "Custom Request" : "Store Order"}
          </p>

          <p style={{ fontWeight: "600" }}>
            {job.customerName || "No Name"}
          </p>

          <p style={{ fontSize: "12px", color: "#6b7280" }}>
            {job.printType || "—"}
          </p>

          <p style={{ fontSize: "11px", color: statusColor[job.status] }}>
            {job.status}
          </p>

          {job.updatedAt && (
            <p style={{ fontSize: "10px", color: "#94a3b8" }}>
              ⏱ {new Date(job.updatedAt).toLocaleString()}
            </p>
          )}
        </div>

        {job.status === "shipping" && (
          <input
            defaultValue={job.trackingNumber || ""}
            placeholder="Tracking..."
            onClick={(e) => e.stopPropagation()}
            onBlur={(e) => saveTracking(e.target.value)}
            style={{ marginTop: "6px", width: "100%" }}
          />
        )}

        {job.trackingNumber && (
          <p style={{ fontSize: "11px", color: "green" }}>
            📦 {job.trackingNumber}
          </p>
        )}
      </div>
    </div>
  )
}

/* ================= COLUMN ================= */
function Column({ id, title, jobs, onOpen }) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{
        width: "320px",
        background: "#1e293b",
        padding: "12px",
        borderRadius: "12px"
      }}
    >
      <h2 style={{ color: "white" }}>
        {title} ({jobs.length})
      </h2>

      {jobs.map(job => (
        <DraggableCard key={job._id} job={job} onOpen={onOpen} />
      ))}
    </div>
  )
}

/* ================= MODAL ================= */
function OrderModal({ job, onClose }) {
  const [price, setPrice] = useState("")

  if (!job) return null

  const numericPrice = Number(price) || 0
  const quantity = job.quantity || 1
  const total = numericPrice * quantity

  const convertQuote = async () => {
    if (!numericPrice) return alert("Enter a price")

    try {
      await api.post(`/quotes/${job._id}/convert`, {
        price: numericPrice
      })
      onClose()
    } catch (err) {
      console.error(err)
      alert("Conversion failed")
    }
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ float: "right" }}>✕</button>

        <h2>Order Details</h2>

        <p><b>Name:</b> {job.customerName}</p>
        <p><b>Email:</b> {job.email || "—"}</p>
        <p><b>Status:</b> {job.status}</p>

        {job.artwork && (
          <img
            src={`${API_URL}/uploads/${job.artwork}`}
            alt="Artwork"
            style={{ width: "100%", marginTop: "10px" }}
          />
        )}

        {job.type === "quote" && (
          <>
            <input
              type="number"
              placeholder="Price per item"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{ width: "100%", marginTop: "10px" }}
            />

            <p>Total: ${total}</p>

            <button
              onClick={convertQuote}
              style={{
                marginTop: "10px",
                background: "#22c55e",
                color: "white",
                padding: "10px",
                borderRadius: "6px",
                width: "100%"
              }}
            >
              Approve & Create Order (${total})
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/* ================= STYLES ================= */
const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999
}

const modal = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  width: "400px"
}

/* ================= MAIN ================= */
function ProductionBoard() {
  const [jobs, setJobs] = useState({
    pending: [],
    printing: [],
    ready: [],
    shipping: [],
    shipped: [],
    delivered: []
  })

  const [selectedJob, setSelectedJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const socket = io(API_URL, { transports: ["websocket"] })

    let timeout

    const loadJobs = async () => {
      try {
        setLoading(true)
        const res = await api.get("/production")
        setJobs(res.data)
        setError(null)
      } catch (err) {
        console.error(err)
        setError("Failed to load jobs")
      } finally {
        setLoading(false)
      }
    }

    loadJobs()

    socket.on("jobUpdated", () => {
      clearTimeout(timeout)
      timeout = setTimeout(loadJobs, 300)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const updateStatus = async (job, status) => {
    const endpoint =
      job.type === "quote"
        ? `/quotes/${job._id}/status`
        : `/orders/${job._id}/status`

    await api.patch(endpoint, { status })
  }

  const handleDragEnd = async ({ active, over }) => {
    if (!over) return

    let found = null
    let source = null

    Object.entries(jobs).forEach(([col, list]) => {
      list.forEach(j => {
        if (j._id === active.id) {
          found = j
          source = col
        }
      })
    })

    if (!found || source === over.id) return

    const prevJobs = structuredClone(jobs)

    setJobs(prev => {
      const updated = { ...prev }

      updated[source] = updated[source].filter(j => j._id !== active.id)
      updated[over.id] = [{ ...found, status: over.id }, ...updated[over.id]]

      return updated
    })

    try {
      await updateStatus(found, over.id)
    } catch (err) {
      console.error(err)
      setJobs(prevJobs)
    }
  }

  if (loading) return <p style={{ color: "white" }}>Loading...</p>
  if (error) return <p style={{ color: "red" }}>{error}</p>

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh" }}>
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
          {Object.entries(jobs).map(([key, value]) => (
            <Column
              key={key}
              id={key}
              title={key.toUpperCase()}
              jobs={value}
              onOpen={setSelectedJob}
            />
          ))}
        </div>
      </DndContext>

      {selectedJob && (
        <OrderModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  )
}

export default ProductionBoard