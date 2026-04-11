import { useEffect, useState } from "react"
import api from "../services/api"
import { DndContext, closestCenter } from "@dnd-kit/core"

export default function ProductionBoard() {

  const [jobs, setJobs] = useState(null)

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/production")

        console.log("🔥 PRODUCTION DATA:", res.data)

        // ✅ FORCE SAFE OBJECT
        if (res?.data && typeof res.data === "object") {
          setJobs(res.data)
        } else {
          console.warn("⚠️ Unexpected data format")
          setJobs({})
        }

      } catch (err) {
        console.error("❌ LOAD FAILED:", err)
        setJobs({})
      }
    }

    load()
  }, [])

  /* ================= DRAG ================= */
  const handleDragEnd = async ({ active, over }) => {
    // ✅ HARD GUARD (prevents crash)
    if (!active?.id || !over?.id) return

    const jobId = active.id
    const newStatus = over.id

    console.log("🔥 DRAGGING:", jobId)

    try {
      await api.patch(`/orders/${jobId}/status`, {
        status: newStatus
      })

      console.log("✅ STATUS UPDATED")

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
      <h1 style={{ marginBottom: 20 }}>🏭 Production Board</h1>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div style={{
          display: "flex",
          gap: 20,
          marginTop: 20,
          alignItems: "flex-start",
          flexWrap: "wrap" // ✅ prevents layout break
        }}>

          {Object.entries(jobs || {}).map(([status, list]) => (
            <div
              key={status}
              id={status}
              style={{
                minWidth: 240,
                maxWidth: 260,
                background: "#1e293b",
                padding: 12,
                borderRadius: 8,
                flexShrink: 0
              }}
            >
              <h3 style={{
                marginBottom: 10,
                textTransform: "capitalize"
              }}>
                {status}
              </h3>

              {(Array.isArray(list) ? list : []).map(job => (
                <div
                  key={job._id}
                  id={job._id}
                  style={{
                    padding: 10,
                    marginBottom: 10,
                    background: "#334155",
                    borderRadius: 6,
                    cursor: "grab"
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>
                    {job.customerName || "No Name"}
                  </div>

                  <div style={{
                    fontSize: 12,
                    opacity: 0.7
                  }}>
                    #{job._id?.slice(-6)}
                  </div>
                </div>
              ))}

            </div>
          ))}

        </div>
      </DndContext>
    </div>
  )
}