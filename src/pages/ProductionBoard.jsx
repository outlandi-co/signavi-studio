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

const COMPLETED_QUOTE_STATUSES = [
  "approved",
  "denied",
  "payment_required",
  "ready_for_production",
  "production",
  "shipping",
  "shipped",
  "closed",
  "archive"
]

function DropColumn({ id, jobs }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
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
        borderRadius: 10
      }}
    >
      <h3 style={{ color: "white" }}>{id}</h3>

      {jobs.map(job => (
        <JobCard
          key={job._id}
          job={job}
          isQuoteCard={false}
        />
      ))}
    </div>
  )
}

export default function ProductionBoard() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor)
  )

  const isPendingQuote = (quote) => {
    const approvalStatus = quote.approvalStatus || "pending"
    const quoteStatus = quote.status || "pending"

    return (
      approvalStatus === "pending" &&
      !COMPLETED_QUOTE_STATUSES.includes(quoteStatus)
    )
  }

  const load = async () => {
    try {
      setLoading(true)

      const [ordersRes, quotesRes] = await Promise.all([
        api.get("/orders"),
        api.get("/quotes").catch(() => ({
          data: { data: [] }
        }))
      ])

      const orders = ordersRes.data?.data || []
      const quotes = quotesRes.data?.data || []

      const pendingQuotes = quotes.filter(isPendingQuote)

      const merged = [
        ...pendingQuotes.map(q => ({
          ...q,
          status: "quotes",
          source: "quote"
        })),

        ...orders.map(order => ({
          ...order,
          source: order.source || "order"
        }))
      ]

      setJobs(merged)
    } catch (err) {
      console.error("❌ LOAD ERROR:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
  const timer = setTimeout(() => {
    load()
  }, 0)

  return () => clearTimeout(timer)

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

  const removeQuoteFromBoard = (quoteId) => {
    setJobs(prev =>
      prev.filter(job => job._id !== quoteId)
    )
  }

  const refreshOrdersOnly = async () => {
    try {
      const ordersRes = await api.get("/orders")
      const orders = ordersRes.data?.data || []

      setJobs(prev => {
        const remainingQuotes = prev.filter(
          job => job.source === "quote"
        )

        return [
          ...remainingQuotes,
          ...orders.map(order => ({
            ...order,
            source: order.source || "order"
          }))
        ]
      })
    } catch (err) {
      console.error("❌ REFRESH ORDERS ERROR:", err)
    }
  }

  const handleApprove = async (job) => {
    try {
      removeQuoteFromBoard(job._id)

      const finalPrice = Number(
        job.finalPrice ||
        job.price ||
        0
      )

      await api.patch(`/quotes/${job._id}`, {
        approvalStatus: "approved",
        status: "approved",
        finalPrice
      })

      await refreshOrdersOnly()

      console.log("✅ Approved")
    } catch (err) {
      console.error(
        "❌ APPROVE ERROR:",
        err.response?.data || err.message
      )

      await load()
    }
  }

  const handleDeny = async (job) => {
    try {
      removeQuoteFromBoard(job._id)

      await api.patch(`/quotes/${job._id}`, {
        approvalStatus: "denied",
        status: "denied"
      })

      console.log("❌ Denied")
    } catch (err) {
      console.error(
        "❌ DENY ERROR:",
        err.response?.data || err.message
      )

      await load()
    }
  }

  const handleDragEnd = async ({ active, over }) => {
    if (!over) return

    const jobId = active.id
    const columnId = over?.data?.current?.columnId

    if (!VALID_STATUSES.includes(columnId)) return

    const draggedJob = jobs.find(job => job._id === jobId)

    if (!draggedJob || draggedJob.source === "quote") return

    try {
      await api.patch(`/orders/${jobId}`, {
        status: columnId
      })

      setJobs(prev =>
        prev.map(job =>
          job._id === jobId
            ? { ...job, status: columnId }
            : job
        )
      )
    } catch (err) {
      console.error("❌ DRAG ERROR:", err)
    }
  }

  const grouped = {
    quotes: jobs.filter(
      job =>
        job.status === "quotes" &&
        job.source === "quote" &&
        isPendingQuote(job)
    ),

    payment_required: jobs.filter(
      job => job.status === "payment_required"
    ),

    ready_for_production: jobs.filter(
      job => job.status === "ready_for_production"
    ),

    production: jobs.filter(
      job => job.status === "production"
    ),

    shipping: jobs.filter(
      job => job.status === "shipping"
    ),

    shipped: jobs.filter(
      job => job.status === "shipped"
    )
  }

  return (
    <div
      style={{
        padding: 20,
        background: "#020617",
        minHeight: "100vh"
      }}
    >
      <h1 style={{ color: "white" }}>
        🏭 Production Board
      </h1>

      {loading && (
        <p style={{ color: "#94a3b8" }}>
          Loading board...
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div
          style={{
            display: "flex",
            gap: 20,
            overflowX: "auto",
            paddingBottom: 20
          }}
        >
          <div
            style={{
              width: 260,
              minHeight: 400,
              background: "#0f172a",
              padding: 12,
              borderRadius: 10
            }}
          >
            <h3 style={{ color: "white" }}>quotes</h3>

            {grouped.quotes.length === 0 && (
              <p style={{ color: "#64748b" }}>
                No pending quotes
              </p>
            )}

            {grouped.quotes.map(job => (
              <JobCard
                key={job._id}
                job={job}
                onApprove={handleApprove}
                onDeny={handleDeny}
                isQuoteCard={true}
              />
            ))}
          </div>

          {Object.entries(grouped)
            .filter(([col]) => col !== "quotes")
            .map(([col, list]) => (
              <DropColumn
                key={col}
                id={col}
                jobs={list}
              />
            ))}
        </div>
      </DndContext>
    </div>
  )
}