import { useEffect, useState, useRef } from "react"
import api from "../services/api"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { io } from "socket.io-client"
import { Column } from "../components/Column"
import { arrayMove } from "@dnd-kit/sortable"

export default function ProductionBoard() {
  const [jobs, setJobs] = useState(null)
  const socketRef = useRef(null)

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    let isMounted = true

    const init = async () => {
      try {
        const quotesRes = await api.get("/quotes").catch(() => ({ data: { data: [] } }))
        const ordersRes = await api.get("/orders")

        if (!isMounted) return

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

    init()

    return () => {
      isMounted = false
    }
  }, [])

  /* ================= SOCKET ================= */
  useEffect(() => {
    socketRef.current = io("https://signavi-backend.onrender.com")

    socketRef.current.on("orderUpdated", (updatedOrder) => {
      setJobs(prev => {
        if (!prev) return prev

        const updated = { ...prev }

        // remove from all columns
        Object.keys(updated).forEach(key => {
          if (key === "quotes") return
          updated[key] = updated[key].filter(j => j._id !== updatedOrder._id)
        })

        // add to correct column
        if (updated[updatedOrder.status]) {
          updated[updatedOrder.status] = [
            updatedOrder,
            ...updated[updatedOrder.status]
          ]
        }

        return updated
      })
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
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

    Object.entries(jobs).forEach(([key, arr]) => {
      if (key === "quotes") return
      if (arr.some(j => j._id === jobId)) sourceColumn = key
    })

    Object.entries(jobs).forEach(([key, arr]) => {
      if (key === "quotes") return
      if (arr.some(j => j._id === overId)) targetColumn = key
    })

    // dropping into empty column
    if (!targetColumn && overData?.type === "column") {
      targetColumn = overData.columnId
    }

    if (!sourceColumn || !targetColumn) return

    /* 🔥 SAME COLUMN (REORDER) */
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

    /* 🔥 MOVE BETWEEN COLUMNS */
    try {
      await api.patch(`/orders/${jobId}/status`, {
        status: targetColumn
      })

      setJobs(prev => {
        if (!prev) return prev

        const sourceItems = prev[sourceColumn].filter(j => j._id !== jobId)
        const movedItem = prev[sourceColumn].find(j => j._id === jobId)

        if (!movedItem) return prev

        const updatedItem = { ...movedItem, status: targetColumn }

        return {
          ...prev,
          [sourceColumn]: sourceItems,
          [targetColumn]: [updatedItem, ...prev[targetColumn]]
        }
      })

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