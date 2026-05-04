import { useEffect, useState } from "react"
import api from "../services/api"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import { Column } from "../components/Column"

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

    /* 🔥 USE COLUMN DATA (NOT over.id) */
    const columnId = over?.data?.current?.columnId

    if (!columnId) {
      console.warn("❌ NOT DROPPED ON COLUMN")
      return
    }

    if (!VALID_STATUSES.includes(columnId)) {
      console.warn("❌ INVALID COLUMN:", columnId)
      return
    }

    try {
      await api.patch(`/orders/${jobId}/status`, {
        status: columnId
      })

      setJobs(prev =>
        prev.map(j =>
          j._id === jobId ? { ...j, status: columnId } : j
        )
      )
    } catch (err) {
      console.error("❌ DRAG ERROR:", err.response?.data || err.message)
    }
  }

  /* ================= GROUP ================= */
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

          {/* 🔥 QUOTES (VIEW ONLY) */}
          <div style={{ width: 260 }}>
            <h3 style={{ color: "white" }}>quotes</h3>

            {grouped.quotes.map(job => (
              <div
                key={job._id}
                style={{
                  padding: 12,
                  marginBottom: 10,
                  background: "#334155",
                  borderRadius: 8,
                  color: "white"
                }}
              >
                {job.customerName || "Guest"}
              </div>
            ))}
          </div>

          {/* 🔥 REAL DROP ZONES */}
          {Object.entries(grouped)
            .filter(([col]) => col !== "quotes")
            .map(([col, list]) => (
              <Column key={col} id={col} jobs={list} />
            ))}

        </div>
      </DndContext>
    </div>
  )
}