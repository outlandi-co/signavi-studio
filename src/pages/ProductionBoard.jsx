import { useEffect, useState } from "react"
import api from "../services/api"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable
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

/* ================= DROPPABLE COLUMN ================= */
function DropColumn({ id, jobs }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "column",
      columnId: id
    }
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        width: 260,
        minHeight: 400,
        background: isOver ? "#1e293b" : "#0f172a",
        padding: 12,
        borderRadius: 10,
        transition: "0.2s"
      }}
    >
      <h3 style={{ color: "white", marginBottom: 10 }}>{id}</h3>

      {jobs.map(job => (
        <JobCard key={job._id} job={job} />
      ))}
    </div>
  )
}

export default function ProductionBoard() {
  const [jobs, setJobs] = useState([])
  const sensors = useSensors(useSensor(PointerSensor))

  /* ================= LOAD (FIXED) ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes, quotesRes] = await Promise.all([
          api.get("/orders"),
          api.get("/quotes").catch(() => ({ data: { data: [] } }))
        ])

        const orders = ordersRes.data?.data || []
        const quotes = quotesRes.data?.data || []

        /* 🔥 MERGE */
        const merged = [
          ...quotes.map(q => ({
            ...q,
            status: "quotes",
            source: "quote"
          })),
          ...orders
        ]

        setJobs(merged)

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
      await api.patch(`/orders/${jobId}`, {
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

          {/* 🔥 QUOTES (NOW USES JobCard) */}
          <div style={{ width: 260 }}>
            <h3 style={{ color: "white" }}>quotes</h3>

            {grouped.quotes.map(job => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>

          {/* 🔥 DRAG COLUMNS */}
          {Object.entries(grouped)
            .filter(([col]) => col !== "quotes")
            .map(([col, list]) => (
              <DropColumn key={col} id={col} jobs={list} />
            ))}

        </div>
      </DndContext>
    </div>
  )
}