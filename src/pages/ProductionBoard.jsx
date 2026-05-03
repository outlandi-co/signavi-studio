import { useEffect, useState, useRef } from "react"
import api from "../services/api"
import { DndContext, closestCorners } from "@dnd-kit/core"
import { io } from "socket.io-client"
import { Column } from "../components/Column"

export default function ProductionBoard() {
  const [jobs, setJobs] = useState(null)
  const socketRef = useRef(null)

  /* ================= LOAD ================= */
  const load = async () => {
    try {
      const quotesRes = await api.get("/quotes").catch(() => ({ data: { data: [] } }))
      const ordersRes = await api.get("/orders")

      const quotes = quotesRes.data?.data || []
      const orders = ordersRes.data?.data || []

      setJobs({
        quotes, // ✅ keep quotes separate
        payment_required: orders.filter(o => o.status === "payment_required"),
        ready_for_production: orders.filter(o => o.status === "ready_for_production"),
        production: orders.filter(o => o.status === "production"),
        shipping: orders.filter(o => o.status === "shipping"),
        shipped: orders.filter(o => o.status === "shipped")
      })

    } catch (err) {
      console.error("❌ LOAD ERROR:", err)
    }
  }

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
  const init = async () => {
    try {
      await load()
    } catch (err) {
      console.error("❌ INIT LOAD ERROR:", err)
    }
  }

  init()
}, [])

  /* ================= SOCKET ================= */
  useEffect(() => {
    socketRef.current = io("https://signavi-backend.onrender.com")

    socketRef.current.on("orderUpdated", (updatedOrder) => {
      setJobs(prev => {
        if (!prev) return prev

        const updated = { ...prev }

        Object.keys(updated).forEach(key => {
          if (key === "quotes") return // ✅ DON'T TOUCH QUOTES
          updated[key] = updated[key].filter(j => j._id !== updatedOrder._id)
        })

        if (updated[updatedOrder.status]) {
          updated[updatedOrder.status] = [
            updatedOrder,
            ...updated[updatedOrder.status]
          ]
        }

        return updated
      })
    })

    return () => socketRef.current.disconnect()
  }, [])

  /* ================= DRAG ================= */
  const handleDragEnd = async ({ active, over }) => {
    console.log("DRAG EVENT:", { active, over })

    if (!active || !over) return

    const jobId = active.id
    const columnData = over.data?.current

    if (!columnData || columnData.type !== "column") {
      console.warn("❌ Not dropped on a column:", columnData)
      return
    }

    const newStatus = columnData.columnId

    // 🔍 find job (IGNORE quotes)
    const currentJob = Object.values(jobs)
      .filter((_, key) => Object.keys(jobs)[key] !== "quotes")
      .flat()
      .find(j => j._id === jobId)

    if (!currentJob) return
    if (currentJob.source === "quote") return
    if (currentJob.status === newStatus) return

    try {
      console.log("➡️ MOVING:", jobId, "TO:", newStatus)

      const res = await api.patch(`/orders/${jobId}/status`, {
        status: newStatus
      })

      const updatedJob = res.data?.data
      if (!updatedJob) return

      /* 🔥 FIX: PRESERVE QUOTES + REBUILD ORDERS */
      setJobs(prev => {
        const quotes = prev.quotes || []

        const allOrders = Object.entries(prev)
          .filter(([key]) => key !== "quotes")
          .flatMap(([, arr]) => arr)

        const updatedOrders = allOrders.map(job =>
          job._id === jobId
            ? { ...job, status: newStatus }
            : job
        )

        const regrouped = {
          quotes, // ✅ KEEP QUOTES
          payment_required: [],
          ready_for_production: [],
          production: [],
          shipping: [],
          shipped: []
        }

        updatedOrders.forEach(job => {
          if (regrouped[job.status]) {
            regrouped[job.status].push(job)
          }
        })

        return regrouped
      })

    } catch (err) {
      console.error("❌ PATCH ERROR:", err)
    }
  }

  if (!jobs) return <div style={{ padding: 20 }}>Loading...</div>

  return (
    <div style={{ padding: 20, background: "#020617", minHeight: "100vh", color: "white" }}>
      <h1>🏭 Production Board</h1>

      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div style={{ display: "flex", gap: 20 }}>
          {Object.entries(jobs).map(([status, list]) => (
            <Column key={status} id={status} jobs={list} />
          ))}
        </div>
      </DndContext>
    </div>
  )
}