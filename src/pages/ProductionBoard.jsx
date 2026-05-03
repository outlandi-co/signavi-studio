import { useEffect, useState, useRef } from "react"
import api from "../services/api"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { Column } from "../components/Column"
import { arrayMove } from "@dnd-kit/sortable"
import { getSocket } from "../services/socket"

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
        quotes,
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

  /* ================= INITIAL LOAD (NO ESLINT WARNING) ================= */
  useEffect(() => {
    const init = async () => {
      await load()
    }
    init()
  }, [])

  /* ================= SOCKET ================= */
  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket

    const handleUpdate = () => {
      console.log("🔄 Realtime update → reload board")
      load()
    }

    socket.on("orderUpdated", handleUpdate)
    socket.on("orderCreated", handleUpdate)

    return () => {
      socket.off("orderUpdated", handleUpdate)
      socket.off("orderCreated", handleUpdate)
    }
  }, [])

  /* ================= DRAG ================= */
  const handleDragEnd = async ({ active, over }) => {
    if (!active || !over || !jobs) return

    const jobId = active.id
    const overId = over.id
    const overData = over.data?.current

    let sourceColumn = null
    let targetColumn = null

    // FIND SOURCE
    for (const [key, arr] of Object.entries(jobs)) {
      if (key === "quotes") continue
      if (arr.some(j => j._id === jobId)) {
        sourceColumn = key
        break
      }
    }

    // FIND TARGET
    if (overData?.type === "column") {
      targetColumn = overData.columnId
    } else {
      for (const [key, arr] of Object.entries(jobs)) {
        if (key === "quotes") continue
        if (arr.some(j => j._id === overId)) {
          targetColumn = key
          break
        }
      }
    }

    if (!sourceColumn || !targetColumn) return

    /* SAME COLUMN (UI reorder only) */
    if (sourceColumn === targetColumn) {
      const items = jobs[sourceColumn]
      const oldIndex = items.findIndex(j => j._id === jobId)
      const newIndex = items.findIndex(j => j._id === overId)

      if (oldIndex !== newIndex && newIndex !== -1) {
        setJobs(prev => ({
          ...prev,
          [sourceColumn]: arrayMove(prev[sourceColumn], oldIndex, newIndex)
        }))
      }
      return
    }

    /* MOVE BETWEEN COLUMNS */
    try {
      await api.patch(`/orders/${jobId}/status`, {
        status: targetColumn
      })

      // 🔥 FORCE REALTIME SYNC
      await load()

    } catch (err) {
      console.error("❌ MOVE ERROR:", err)
    }
  }

  if (!jobs) return <div style={{ padding: 20 }}>Loading...</div>

  return (
    <div style={{ padding: 20, background: "#020617", minHeight: "100vh", color: "white" }}>
      <h1>🏭 Production Board</h1>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div style={{ display: "flex", gap: 20 }}>
          {Object.entries(jobs).map(([status, list]) => (
            <Column key={status} id={status} jobs={list} />
          ))}
        </div>
      </DndContext>
    </div>
  )
}