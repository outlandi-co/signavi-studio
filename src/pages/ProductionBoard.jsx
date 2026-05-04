import { useEffect, useState, useRef } from "react"
import api from "../services/api"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { getSocket } from "../services/socket"

/* ================= DRAG CARD ================= */
function JobCard({ job }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: job._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: "#1e293b",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    cursor: "grab"
  }

  const approve = async (e) => {
    e.stopPropagation()
    await api.patch(`/orders/${job._id}/status`, { status: "approved" })
  }

  const deny = async (e) => {
    e.stopPropagation()
    await api.patch(`/orders/${job._id}/status`, { status: "denied" })
  }

  const addTracking = async (e) => {
    e.stopPropagation()
    const tracking = prompt("Tracking #")
    if (!tracking) return

    await api.patch(`/orders/${job._id}/status`, {
      status: "shipping",
      trackingNumber: tracking
    })
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div {...attributes} {...listeners} style={{ fontSize: 10 }}>
        ⠿ drag
      </div>

      <p>{job.customerName}</p>
      <p style={{ fontSize: 12, opacity: 0.6 }}>{job.status}</p>

      {/* PRICE */}
      {job.finalPrice > 0 && (
        <p style={{ color: "#22c55e" }}>💰 ${job.finalPrice}</p>
      )}

      {/* DOWNLOAD */}
      {job.artwork && (
        <a
          href={`https://signavi-backend.onrender.com/uploads/${job.artwork}`}
          download
          onClick={(e) => e.stopPropagation()}
        >
          ⬇ Download
        </a>
      )}

      {/* APPROVE / DENY */}
      {job.status === "quotes" && (
        <div>
          <button onClick={approve}>Approve</button>
          <button onClick={deny}>Deny</button>
        </div>
      )}

      {/* TRACKING */}
      {job.status === "production" && (
        <button onClick={addTracking}>Ship</button>
      )}
    </div>
  )
}

/* ================= COLUMN ================= */
function Column({ id, jobs }) {
  return (
    <div
      style={{
        width: 260,
        background: "#0f172a",
        padding: 10,
        borderRadius: 10
      }}
    >
      <h3 style={{ color: "white" }}>{id}</h3>

      <SortableContext
        items={jobs.map(j => j._id)}
        strategy={verticalListSortingStrategy}
      >
        {jobs.map(job => (
          <JobCard key={job._id} job={job} />
        ))}
      </SortableContext>
    </div>
  )
}

/* ================= MAIN ================= */
export default function ProductionBoard() {
  const [jobs, setJobs] = useState([])
  const socketRef = useRef(null)

  const sensors = useSensors(useSensor(PointerSensor))

  /* LOAD */
  const load = async () => {
    const res = await api.get("/orders")
    const list = res.data?.data || []
    setJobs(list)
  }

  useEffect(() => {
  let mounted = true

  const init = async () => {
    try {
      const res = await api.get("/orders")
      const list = res.data?.data || []

      if (mounted) {
        setJobs(list)
      }
    } catch (err) {
      console.error("❌ LOAD ERROR:", err)
    }
  }

  init()

  return () => {
    mounted = false
  }
}, [])

  /* SOCKET */
  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket

    const update = () => load()

    socket.on("orderUpdated", update)
    socket.on("orderCreated", update)

    return () => {
      socket.off("orderUpdated", update)
      socket.off("orderCreated", update)
    }
  }, [])

  /* DRAG */
  const handleDragEnd = async ({ active, over }) => {
    if (!over) return

    const jobId = active.id
    const newStatus = over.id

    try {
      await api.patch(`/orders/${jobId}/status`, {
        status: newStatus
      })

      setJobs(prev =>
        prev.map(j =>
          j._id === jobId ? { ...j, status: newStatus } : j
        )
      )
    } catch (err) {
      console.error(err)
    }
  }

  const grouped = {
    quotes: jobs.filter(j => j.status === "quotes"),
    payment_required: jobs.filter(j => j.status === "payment_required"),
    ready_for_production: jobs.filter(j => j.status === "ready_for_production"),
    production: jobs.filter(j => j.status === "production"),
    shipping: jobs.filter(j => j.status === "shipping"),
    shipped: jobs.filter(j => j.status === "shipped")
  }

  return (
    <div style={{ padding: 20, background: "#020617", minHeight: "100vh" }}>
      <h1 style={{ color: "white" }}>🏭 Production Board</h1>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: "flex", gap: 20 }}>
          {Object.entries(grouped).map(([col, list]) => (
            <Column key={col} id={col} jobs={list} />
          ))}
        </div>
      </DndContext>
    </div>
  )
}