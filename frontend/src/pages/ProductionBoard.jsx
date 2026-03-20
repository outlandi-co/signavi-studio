import { useEffect, useState } from "react"
import api from "../services/api"
import { io } from "socket.io-client"

import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable
} from "@dnd-kit/core"

/* 🔥 SOCKET (single instance) */
const socket = io("http://localhost:5050", {
  transports: ["websocket"]
})

/* ================= CARD ================= */
function DraggableCard({ job, onOpen }) {

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: job?._id || "fallback-id"
  })

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined
  }

  const imageUrl = job?.artwork
    ? `http://localhost:5050/uploads/${job.artwork}`
    : null

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

  if (!job) return null

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: "#fff",
        borderRadius: "12px",
        padding: "12px",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (onOpen) onOpen(job)
      }}
      {...listeners}
      {...attributes}
    >

      {/* 🔥 IMAGE */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Artwork preview"
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

      <p style={{ fontSize: "11px", color: "#9ca3af" }}>
        {job.status || "pending"}
      </p>

      {/* TRACKING INPUT */}
      {job.status === "shipping" && (
        <input
          placeholder="Tracking..."
          onClick={(e) => e.stopPropagation()}
          onBlur={(e) => saveTracking(e.target.value)}
          style={{ marginTop: "6px", width: "100%" }}
        />
      )}

      {/* SHOW TRACKING */}
      {job.trackingNumber && (
        <p style={{ fontSize: "11px", color: "green" }}>
          📦 {job.trackingNumber}
        </p>
      )}
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
    if (!numericPrice) {
      alert("Enter a price first")
      return
    }

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
            src={`http://localhost:5050/uploads/${job.artwork}`}
            alt="Artwork"
            style={{ width: "100%", marginTop: "10px" }}
          />
        )}

        {job.type === "quote" && (
          <>
            <div style={{ marginTop: "12px" }}>
              <label>Price per item</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{ width: "100%", padding: "6px", marginTop: "4px" }}
              />
            </div>

            <p>Quantity: {quantity}</p>

            <p style={{ fontWeight: "bold" }}>
              Total: ${total}
            </p>

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
  width: "400px",
  maxHeight: "80vh",
  overflowY: "auto"
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

  useEffect(() => {

    const loadJobs = async () => {
      try {
        const res = await api.get("/production")
        setJobs(res.data)
      } catch (err) {
        console.error("Fetch error:", err)
      }
    }

    loadJobs()

    /* 🔥 SAFE SOCKET LISTENER */
    const handleUpdate = () => {
      console.log("⚡ Live update received")
      loadJobs()
    }

    socket.on("jobUpdated", handleUpdate)

    return () => {
      socket.off("jobUpdated", handleUpdate)
    }

  }, [])

  const updateStatus = async (job, status) => {
    const endpoint =
      job.type === "quote"
        ? `/quotes/${job._id}/status`
        : `/orders/${job._id}/status`

    try {
      await api.patch(endpoint, { status })
    } catch (err) {
      console.error(err)
    }
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

    setJobs(prev => {
      const updated = { ...prev }

      updated[source] = updated[source].filter(j => j._id !== active.id)

      updated[over.id] = [
        { ...found, status: over.id },
        ...updated[over.id]
      ]

      return updated
    })

    await updateStatus(found, over.id)
  }

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh" }}>
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
          <Column id="pending" title="Requests" jobs={jobs.pending} onOpen={setSelectedJob} />
          <Column id="printing" title="Production" jobs={jobs.printing} onOpen={setSelectedJob} />
          <Column id="ready" title="Ready" jobs={jobs.ready} onOpen={setSelectedJob} />
          <Column id="shipping" title="Shipping" jobs={jobs.shipping} onOpen={setSelectedJob} />
          <Column id="shipped" title="Shipped" jobs={jobs.shipped} onOpen={setSelectedJob} />
          <Column id="delivered" title="Delivered" jobs={jobs.delivered} onOpen={setSelectedJob} />
        </div>
      </DndContext>

      {selectedJob && (
        <OrderModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  )
}

export default ProductionBoard