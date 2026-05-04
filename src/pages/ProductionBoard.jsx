import { useEffect, useState } from "react"
import api from "../services/api"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import JobCard from "../components/JobCard"

/* ================= VALID STATUSES ================= */
const VALID_STATUSES = [
  "payment_required",
  "ready_for_production",
  "production",
  "shipping",
  "shipped"
]

export default function ProductionBoard() {
  const [jobs, setJobs] = useState([])
  const sensors = useSensors(useSensor(PointerSensor))

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/orders")
        setJobs(res.data?.data || [])
      } catch (err) {
        console.error("❌ LOAD ERROR:", err)
      }
    }

    load()
  }, [])

  /* ================= DRAG ================= */
  const handleDragEnd = async ({ active, over }) => {
    if (!over) return

    const jobId = active.id
    const newStatus = over.id

    /* 🔥 BLOCK INVALID DROPS */
    if (!VALID_STATUSES.includes(newStatus)) {
      console.warn("❌ BLOCKED INVALID DROP:", newStatus)
      return
    }

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
      console.error("❌ DRAG ERROR:", err.response?.data || err.message)
    }
  }

  /* ================= GROUP ================= */
  const grouped = {
    quotes: jobs.filter(j => j.status === "quotes"), // display only
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

          {/* 🔥 QUOTES (NOT DROPPABLE) */}
          <div style={{ width: 260 }}>
            <h3 style={{ color: "white" }}>quotes</h3>
            {grouped.quotes.map(job => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>

          {/* 🔥 VALID COLUMNS ONLY */}
          {Object.entries(grouped)
            .filter(([col]) => col !== "quotes")
            .map(([col, list]) => (
              <div
                key={col}
                id={col}
                style={{
                  width: 260,
                  background: "#0f172a",
                  padding: 10,
                  borderRadius: 10
                }}
              >
                <h3 style={{ color: "white" }}>{col}</h3>

                {list.map(job => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            ))}

        </div>
      </DndContext>
    </div>
  )
}