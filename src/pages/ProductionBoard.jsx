import { useEffect, useState, useRef } from "react"
import api from "../services/api"
import { DndContext, useDroppable } from "@dnd-kit/core"
import { io } from "socket.io-client"
import JobCard from "../components/JobCard"

const getColor = (status) => {
  switch (status) {
    case "quotes": return "#1e293b"
    case "payment_required": return "#7c2d12"
    case "ready_for_production": return "#78350f" // 🔥 NEW
    case "production": return "#1e40af"
    case "shipping": return "#065f46"
    case "shipped": return "#4c1d95"
    default: return "#1e293b"
  }
}

function Column({ status, jobs, refresh }) {
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
        <JobCard
          key={job._id}
          job={job}
          onUpdate={refresh}
        />
      ))}
    </div>
  )
}

export default function ProductionBoard() {
  const [jobs, setJobs] = useState(null)
  const socketRef = useRef(null)

  /* ================= LOAD DATA ================= */
  const load = async () => {
    try {
      let quotes = []

      try {
        const quotesRes = await api.get("/quotes")
        quotes = quotesRes.data?.data || []
      } catch {
        console.warn("⚠️ /quotes not available — skipping")
      }

      const ordersRes = await api.get("/orders")
      const orders = ordersRes.data?.data || []

      console.log("🔥 ORDERS LOADED:", orders.length)

      const grouped = {
        quotes,
        payment_required: orders.filter(o => o.status === "payment_required"),
        ready_for_production: orders.filter(o => o.status === "ready_for_production"), // 🔥 NEW
        production: orders.filter(o => o.status === "production"),
        shipping: orders.filter(o => o.status === "shipping"),
        shipped: orders.filter(o => o.status === "shipped")
      }

      setJobs(grouped)

    } catch (err) {
      console.error("❌ LOAD ERROR:", err)

      setJobs({
        quotes: [],
        payment_required: [],
        ready_for_production: [],
        production: [],
        shipping: [],
        shipped: []
      })
    }
  }

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
  const init = async () => {
    await load() // ✅ no unused variable
  }

  init()
}, [])

  /* ================= SOCKET ================= */
  useEffect(() => {
    socketRef.current = io("https://signavi-backend.onrender.com")

    const handleJobUpdated = () => {
      console.log("🔄 Job updated — refreshing board")
      load()
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

    if (movedJob?.status === newStatus) return

    try {
      await api.patch(`/orders/${jobId}/status`, { // 🔥 FIXED
        status: newStatus
      })

      console.log("✅ Status updated:", jobId, newStatus)

      load()

    } catch (err) {
      console.error("❌ PATCH ERROR:", err)
    }
  }

  if (!jobs) return <div style={{ padding: 20 }}>Loading production board...</div>

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
            <Column
              key={status}
              status={status}
              jobs={list}
              refresh={load}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}