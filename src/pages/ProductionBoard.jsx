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

const VALID_STATUSES = [
  "payment_required",
  "ready_for_production",
  "production",
  "shipping",
  "shipped"
]

function DropColumn({ id, jobs }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { columnId: id }
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        width: 260,
        minHeight: 400,
        background: isOver ? "#1e293b" : "#0f172a",
        padding: 12,
        borderRadius: 10
      }}
    >
      <h3 style={{ color: "white" }}>{id}</h3>

      {jobs.map(job => (
        <JobCard key={job._id} job={job} />
      ))}
    </div>
  )
}

export default function ProductionBoard() {
  const [jobs, setJobs] = useState([])
  const sensors = useSensors(useSensor(PointerSensor))

  const load = async () => {
    try {
      const [ordersRes, quotesRes] = await Promise.all([
        api.get("/orders"),
        api.get("/quotes").catch(() => ({ data: { data: [] } }))
      ])

      const orders = ordersRes.data?.data || []
      const quotes = quotesRes.data?.data || []

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

  useEffect(() => {
    const init = async () => await load()
    init()
  }, [])

  /* ================= APPROVE ================= */
  const handleApprove = async (job) => {
    try {
      await api.patch(`/quotes/${job._id}`, {
        approvalStatus: "approved",
        finalPrice: job.finalPrice || job.price || 0
      })

      console.log("✅ Approved")
      load()
    } catch (err) {
      console.error("❌ APPROVE ERROR:", err.response?.data || err.message)
    }
  }

  /* ================= DENY ================= */
  const handleDeny = async (job) => {
    try {
      await api.patch(`/quotes/${job._id}`, {
        approvalStatus: "denied"
      })

      console.log("❌ Denied")
      load()
    } catch (err) {
      console.error("❌ DENY ERROR:", err.response?.data || err.message)
    }
  }

  const handleDragEnd = async ({ active, over }) => {
    if (!over) return

    const jobId = active.id
    const columnId = over?.data?.current?.columnId

    if (!VALID_STATUSES.includes(columnId)) return

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
      console.error("❌ DRAG ERROR:", err)
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

          {/* QUOTES */}
          <div style={{ width: 260 }}>
            <h3 style={{ color: "white" }}>quotes</h3>

            {grouped.quotes.map(job => (
              <JobCard
                key={job._id}
                job={job}
                onApprove={handleApprove}
                onDeny={handleDeny}
              />
            ))}
          </div>

          {/* OTHER COLUMNS */}
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