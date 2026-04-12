import { useEffect, useState } from "react"
import api from "../services/api"
import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable
} from "@dnd-kit/core"

/* ================= DRAGGABLE CARD ================= */
function JobCard({ job }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: job._id
  })

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    padding: 10,
    marginBottom: 10,
    background: "#334155",
    borderRadius: 6,
    cursor: "grab"
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div style={{ fontWeight: "bold" }}>
        {job.customerName || "No Name"}
      </div>

      <div style={{ fontSize: 12, opacity: 0.7 }}>
        #{job._id?.slice(-6)}
      </div>
    </div>
  )
}

/* ================= DROPPABLE COLUMN ================= */
function Column({ status, jobs }) {
  const { setNodeRef } = useDroppable({
    id: status
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: 240,
        maxWidth: 260,
        background: "#1e293b",
        padding: 12,
        borderRadius: 8,
        flexShrink: 0
      }}
    >
      <h3 style={{ marginBottom: 10, textTransform: "capitalize" }}>
        {status}
      </h3>

      {(Array.isArray(jobs) ? jobs : []).map(job => (
        <JobCard key={job._id} job={job} />
      ))}
    </div>
  )
}

/* ================= MAIN ================= */
export default function ProductionBoard() {
  const [jobs, setJobs] = useState(null)

  /* ================= LOAD (ESLINT SAFE) ================= */
  useEffect(() => {
    let isMounted = true

    const init = async () => {
      try {
        const res = await api.get("/production")

        console.log("🔥 PRODUCTION DATA:", res.data)

        if (!isMounted) return

        setJobs(
          res?.data && typeof res.data === "object"
            ? res.data
            : {}
        )
      } catch (err) {
        console.error("❌ LOAD FAILED:", err)

        if (isMounted) setJobs({})
      }
    }

    init()

    return () => {
      isMounted = false
    }
  }, [])

  /* ================= DRAG ================= */
  const handleDragEnd = async ({ active, over }) => {
    if (!active?.id || !over?.id) return

    const jobId = active.id
    const newStatus = over.id

    console.log("🔥 DRAGGING:", jobId, "→", newStatus)

    try {
      await api.patch(`/orders/status/${jobId}`, {
        status: newStatus
      })

      console.log("✅ STATUS UPDATED")

      // 🔥 reload AFTER update (no ESLint issues)
      const res = await api.get("/production")
      setJobs(res.data)

    } catch (err) {
      console.error("❌ DRAG ERROR:", err)
    }
  }

  /* ================= LOADING ================= */
  if (!jobs) {
    return (
      <div style={{
        background: "#020617",
        color: "white",
        minHeight: "100vh",
        padding: 40
      }}>
        ⏳ Loading Production Board...
      </div>
    )
  }

  /* ================= UI ================= */
  return (
    <div style={{
      padding: 20,
      background: "#020617",
      minHeight: "100vh",
      color: "white"
    }}>
      <h1 style={{ marginBottom: 20 }}>
        🏭 Production Board
      </h1>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          alignItems: "flex-start"
        }}>
          {Object.entries(jobs).map(([status, list]) => (
            <Column
              key={status}
              status={status}
              jobs={list}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}