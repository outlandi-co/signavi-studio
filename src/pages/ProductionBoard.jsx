import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react"

import api from "../services/api"
import { getSocket } from "../services/socket"

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

const columnLabels = {
  quotes: "Quotes",
  payment_required: "Payment Required",
  ready_for_production: "Ready For Production",
  production: "Production",
  shipping: "Shipping",
  shipped: "Shipped"
}

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const getJobValue = (job = {}) => {
  return Number(
    job.finalPrice ||
      job.total ||
      job.price ||
      job.subtotal ||
      0
  )
}

const searchJob = (job = {}, term = "") => {
  if (!term.trim()) return true

  const haystack = [
    job._id,
    job.customerName,
    job.name,
    job.email,
    job.phone,
    job.status,
    job.source,
    job.orderType,
    job.invoiceNumber,
    job.trackingNumber,
    job.priority,
    job.adminNotes
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return haystack.includes(term.trim().toLowerCase())
}

const isOverdue = (job = {}) => {
  if (!job.dueDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(job.dueDate)
  due.setHours(0, 0, 0, 0)

  return due < today
}

const isHighPriority = (job = {}) => {
  return job.priority === "high"
}

const isDueThisWeek = (job = {}) => {
  if (!job.dueDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(job.dueDate)
  due.setHours(0, 0, 0, 0)

  const diffDays =
    (due.getTime() - today.getTime()) /
    (1000 * 60 * 60 * 24)

  return diffDays >= 0 && diffDays <= 7
}

const sortProductionJobs = (jobs = []) => {
  return [...jobs].sort((a, b) => {
    const aOverdue = isOverdue(a) ? 1 : 0
    const bOverdue = isOverdue(b) ? 1 : 0

    if (aOverdue !== bOverdue) {
      return bOverdue - aOverdue
    }

    const priorityRank = {
      high: 3,
      medium: 2,
      low: 1
    }

    const aPriority = priorityRank[a.priority || "medium"] || 2
    const bPriority = priorityRank[b.priority || "medium"] || 2

    if (aPriority !== bPriority) {
      return bPriority - aPriority
    }

    const aDue = a.dueDate
      ? new Date(a.dueDate).getTime()
      : Number.MAX_SAFE_INTEGER

    const bDue = b.dueDate
      ? new Date(b.dueDate).getTime()
      : Number.MAX_SAFE_INTEGER

    return aDue - bDue
  })
}

const cardStyle = {
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  background: "rgba(15, 23, 42, 0.85)",
  border: "1px solid #1e293b",
  borderRadius: 18,
  padding: 20,
  color: "white",
  boxShadow: "0 14px 35px rgba(0,0,0,.25)"
}

function DropColumn({
  id,
  jobs,
  isMobile = false
}) {
  const {
    setNodeRef,
    isOver
  } = useDroppable({
    id,
    data: {
      columnId: id
    }
  })

  const columnRevenue = jobs.reduce(
    (sum, job) => sum + getJobValue(job),
    0
  )

  return (
    <div
      ref={setNodeRef}
      style={{
        width: isMobile ? "100%" : 320,
        maxWidth: isMobile ? "100%" : 320,
        minWidth: 0,
        minHeight: isMobile ? 360 : 600,
        background: isOver ? "#172554" : "rgba(15, 23, 42, 0.9)",
        padding: isMobile ? 12 : 16,
        boxSizing: "border-box",
        borderRadius: 22,
        border: isOver ? "1px solid #38bdf8" : "1px solid #1e293b",
        boxShadow: "0 16px 40px rgba(0,0,0,.28)",
        flexShrink: 0,
        transition: "all .2s ease"
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: "1px solid #1e293b",
          background: isOver ? "#172554" : "rgba(15, 23, 42, 0.95)"
        }}
      >
        <h3
          style={{
            color: "white",
            fontSize: 16,
            fontWeight: 800,
            margin: 0
          }}
        >
          {columnLabels[id] || id.replaceAll("_", " ")}

          <span
            style={{
              marginLeft: 8,
              color: "#67e8f9"
            }}
          >
            ({jobs.length})
          </span>
        </h3>

        <p
          style={{
            margin: "8px 0 0",
            color: "#94a3b8",
            fontSize: 12,
            fontWeight: 700
          }}
        >
          {money(columnRevenue)}
        </p>
      </div>

      {jobs.length === 0 ? (
        <p
          style={{
            color: "#64748b",
            fontSize: 14,
            margin: 0
          }}
        >
          No jobs in this column
        </p>
      ) : (
        jobs.map((job) => (
          <div
            key={job._id}
            style={{
              position: "relative"
            }}
          >
            {isOverdue(job) && (
              <div style={overdueBadge}>
                ⚠️ Overdue
              </div>
            )}

            <JobCard
              job={job}
              isQuoteCard={false}
            />
          </div>
        ))
      )}
    </div>
  )
}

export default function ProductionBoard() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [viewFilter, setViewFilter] = useState("all")
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= 900
  )

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor)
  )

  const isPendingQuote = useCallback((quote) => {
    const approvalStatus = quote.approvalStatus || "pending"
    const quoteStatus = quote.status || "pending"

    return (
      approvalStatus === "pending" &&
      !COMPLETED_QUOTE_STATUSES.includes(quoteStatus)
    )
  }, [])

  const load = useCallback(async () => {
    try {
      setLoading(true)

      const [
        ordersRes,
        quotesRes
      ] = await Promise.all([
        api.get("/orders"),
        api.get("/quotes").catch(() => ({
          data: {
            data: []
          }
        }))
      ])

      const orders =
        Array.isArray(ordersRes.data)
          ? ordersRes.data
          : ordersRes.data?.data || []

      const quotes =
        Array.isArray(quotesRes.data)
          ? quotesRes.data
          : quotesRes.data?.data || []

      const pendingQuotes =
        quotes.filter(isPendingQuote)

      const merged = [
        ...pendingQuotes.map((quote) => ({
          ...quote,
          status: "quotes",
          source: "quote"
        })),

        ...orders.map((order) => ({
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
  }, [isPendingQuote])

  useEffect(() => {
    const timer = setTimeout(() => {
      load()
    }, 0)

    return () => clearTimeout(timer)
  }, [load])

  useEffect(() => {
    let socket

    const init = async () => {
      socket = await getSocket()

      if (!socket) return

      socket.on("orderCreated", load)
      socket.on("orderUpdated", load)
      socket.on("jobCreated", load)
      socket.on("jobUpdated", load)
      socket.on("quoteUpdated", load)
      socket.on("pricingUpdated", load)
    }

    init()

    return () => {
      socket?.off("orderCreated", load)
      socket?.off("orderUpdated", load)
      socket?.off("jobCreated", load)
      socket?.off("jobUpdated", load)
      socket?.off("quoteUpdated", load)
      socket?.off("pricingUpdated", load)
    }
  }, [load])

  const removeQuoteFromBoard = (quoteId) => {
    setJobs((prev) =>
      prev.filter((job) => job._id !== quoteId)
    )
  }

  const refreshOrdersOnly = async () => {
    try {
      const ordersRes = await api.get("/orders")

      const orders =
        Array.isArray(ordersRes.data)
          ? ordersRes.data
          : ordersRes.data?.data || []

      setJobs((prev) => {
        const remainingQuotes = prev.filter(
          (job) => job.source === "quote"
        )

        return [
          ...remainingQuotes,
          ...orders.map((order) => ({
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

  const handleDragEnd = async ({
    active,
    over
  }) => {
    if (!over) return

    const jobId = active.id
    const columnId =
      over?.data?.current?.columnId

    if (!VALID_STATUSES.includes(columnId)) return

    const draggedJob = jobs.find(
      (job) => job._id === jobId
    )

    if (!draggedJob || draggedJob.source === "quote") return

    try {
      await api.patch(`/orders/${jobId}`, {
        status: columnId
      })

      setJobs((prev) =>
        prev.map((job) =>
          job._id === jobId
            ? {
                ...job,
                status: columnId
              }
            : job
        )
      )
    } catch (err) {
      console.error("❌ DRAG ERROR:", err)
      await load()
    }
  }

  const filteredJobs = useMemo(() => {
    let data = jobs.filter((job) =>
      searchJob(job, search)
    )

    if (viewFilter === "high") {
      data = data.filter(isHighPriority)
    }

    if (viewFilter === "overdue") {
      data = data.filter(isOverdue)
    }

    if (viewFilter === "week") {
      data = data.filter(isDueThisWeek)
    }

    return sortProductionJobs(data)
  }, [
    jobs,
    search,
    viewFilter
  ])

  const grouped = useMemo(() => {
    return {
      quotes: filteredJobs.filter(
        (job) =>
          job.status === "quotes" &&
          job.source === "quote" &&
          isPendingQuote(job)
      ),

      payment_required: filteredJobs.filter(
        (job) => job.status === "payment_required"
      ),

      ready_for_production: filteredJobs.filter(
        (job) => job.status === "ready_for_production"
      ),

      production: filteredJobs.filter(
        (job) => job.status === "production"
      ),

      shipping: filteredJobs.filter(
        (job) => job.status === "shipping"
      ),

      shipped: filteredJobs.filter(
        (job) => job.status === "shipped"
      )
    }
  }, [
    filteredJobs,
    isPendingQuote
  ])

  const boardColumns = Object.entries(grouped).filter(
    ([column]) => column !== "quotes"
  )

  const allOrderJobs = filteredJobs.filter(
    (job) => job.source !== "quote"
  )

  const totalRevenue = allOrderJobs.reduce(
    (sum, job) => sum + getJobValue(job),
    0
  )

  const productionRevenue = grouped.production.reduce(
    (sum, job) => sum + getJobValue(job),
    0
  )

  const shippedRevenue = grouped.shipped.reduce(
    (sum, job) => sum + getJobValue(job),
    0
  )

  const averageOrder =
    allOrderJobs.length > 0
      ? totalRevenue / allOrderJobs.length
      : 0

  const overdueJobs =
    allOrderJobs.filter(isOverdue)

  const highPriorityJobs =
    allOrderJobs.filter(isHighPriority)

  const dueThisWeekJobs =
    allOrderJobs.filter(isDueThisWeek)

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        padding: isMobile ? "18px 14px 90px" : 24,
        boxSizing: "border-box",
        overflowX: "hidden",
        background:
          "radial-gradient(circle at top right, rgba(6,182,212,.12), transparent 35%), #020617",
        minHeight: "100vh"
      }}
    >
      <div
        style={{
          marginBottom: 28
        }}
      >
        <p
          style={{
            color: "#67e8f9",
            textTransform: "uppercase",
            letterSpacing: ".18em",
            marginBottom: 8,
            fontSize: 13,
            fontWeight: 700
          }}
        >
          SignaVi Studio
        </p>

        <h1
          style={{
            color: "white",
            fontSize: isMobile ? 38 : 42,
            lineHeight: 1.02,
            overflowWrap: "anywhere",
            fontWeight: 800,
            margin: 0
          }}
        >
          Production Board
        </h1>

        <p
          style={{
            color: "#94a3b8",
            marginTop: 10,
            maxWidth: 680
          }}
        >
          Track quotes, payments, production, shipping, and completed
          orders from one organized workflow.
        </p>
      </div>

      <div
        style={{
          ...metricGrid,
          gridTemplateColumns: isMobile
            ? "minmax(0, 1fr)"
            : metricGrid.gridTemplateColumns
        }}
      >
        <MetricCard
          value={grouped.quotes.length}
          label="Pending Quotes"
          color="#67e8f9"
        />

        <MetricCard
          value={grouped.payment_required.length}
          label="Awaiting Payment"
          color="#facc15"
        />

        <MetricCard
          value={grouped.production.length}
          label="In Production"
          color="#38bdf8"
        />

        <MetricCard
          value={grouped.shipping.length}
          label="Ready To Ship"
          color="#22c55e"
        />
      </div>

      <div
        style={{
          ...metricGrid,
          gridTemplateColumns: isMobile
            ? "minmax(0, 1fr)"
            : metricGrid.gridTemplateColumns
        }}
      >
        <MetricCard
          value={highPriorityJobs.length}
          label="High Priority"
          color="#ef4444"
        />

        <MetricCard
          value={overdueJobs.length}
          label="Overdue"
          color="#f97316"
        />

        <MetricCard
          value={dueThisWeekJobs.length}
          label="Due This Week"
          color="#facc15"
        />

        <MetricCard
          value={money(totalRevenue)}
          label="Board Revenue"
          color="#22c55e"
        />
      </div>

      <div
        style={{
          ...metricGrid,
          gridTemplateColumns: isMobile
            ? "minmax(0, 1fr)"
            : metricGrid.gridTemplateColumns
        }}
      >
        <MetricCard
          value={money(productionRevenue)}
          label="Production Revenue"
          color="#38bdf8"
        />

        <MetricCard
          value={money(shippedRevenue)}
          label="Shipped Revenue"
          color="#a78bfa"
        />

        <MetricCard
          value={money(averageOrder)}
          label="Average Order"
          color="#f97316"
        />
      </div>

      <div
        style={{
          ...toolbar,
          gridTemplateColumns: isMobile
            ? "minmax(0, 1fr)"
            : toolbar.gridTemplateColumns,
          gap: isMobile ? 10 : 14
        }}
      >
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search customer, email, order, tracking, notes..."
          style={searchInput}
        />

        <select
          value={viewFilter}
          onChange={(event) =>
            setViewFilter(event.target.value)
          }
          style={searchInput}
        >
          <option value="all">
            All Jobs
          </option>

          <option value="high">
            High Priority
          </option>

          <option value="overdue">
            Overdue
          </option>

          <option value="week">
            Due This Week
          </option>
        </select>

        <button
          type="button"
          onClick={load}
          style={{
            ...refreshButton,
            width: "100%",
            minHeight: 50,
            padding: "14px 16px"
          }}
        >
          Refresh
        </button>
      </div>

      {loading && (
        <p
          style={{
            color: "#94a3b8",
            marginBottom: 18
          }}
        >
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
            display: isMobile ? "grid" : "flex",
            gridTemplateColumns: isMobile
              ? "minmax(0, 1fr)"
              : undefined,
            gap: isMobile ? 14 : 24,
            width: "100%",
            minWidth: 0,
            overflowX: isMobile ? "hidden" : "auto",
            paddingBottom: 30,
            alignItems: "flex-start"
          }}
        >
          <div
            style={{
              width: isMobile ? "100%" : 320,
              maxWidth: isMobile ? "100%" : 320,
              minWidth: 0,
              minHeight: isMobile ? 360 : 600,
              background: "rgba(15, 23, 42, 0.9)",
              padding: isMobile ? 12 : 16,
              boxSizing: "border-box",
              borderRadius: 22,
              border: "1px solid #1e293b",
              boxShadow: "0 16px 40px rgba(0,0,0,.28)",
              flexShrink: 0
            }}
          >
            <div
              style={{
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid #1e293b"
              }}
            >
              <h3
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: 800,
                  margin: 0
                }}
              >
                Quotes

                <span
                  style={{
                    marginLeft: 8,
                    color: "#67e8f9"
                  }}
                >
                  ({grouped.quotes.length})
                </span>
              </h3>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#94a3b8",
                  fontSize: 12,
                  fontWeight: 700
                }}
              >
                Pending approval
              </p>
            </div>

            {grouped.quotes.length === 0 && (
              <p
                style={{
                  color: "#64748b",
                  fontSize: 14,
                  margin: 0
                }}
              >
                No pending quotes
              </p>
            )}

            {grouped.quotes.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onApprove={handleApprove}
                onDeny={handleDeny}
                isQuoteCard={true}
              />
            ))}
          </div>

          {boardColumns.map(([column, list]) => (
            <DropColumn
              key={column}
              id={column}
              jobs={list}
              isMobile={isMobile}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}

function MetricCard({
  value,
  label,
  color
}) {
  return (
    <div style={cardStyle}>
      <h2
        style={{
          margin: 0,
          fontSize: 32,
          overflowWrap: "anywhere",
          color
        }}
      >
        {value}
      </h2>

      <p
        style={{
          margin: "8px 0 0",
          color: "#94a3b8"
        }}
      >
        {label}
      </p>
    </div>
  )
}

const metricGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
  marginBottom: 18
}

const toolbar = {
  display: "grid",
  gridTemplateColumns: "1fr 220px 140px",
  gap: 14,
  width: "100%",
  minWidth: 0,
  marginBottom: 24
}

const searchInput = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
  outline: "none",
  fontWeight: 700,
  minWidth: 0
}

const refreshButton = {
  width: "100%",
  boxSizing: "border-box",
  background: "#22d3ee",
  color: "#020617",
  border: "none",
  borderRadius: 16,
  fontWeight: 900,
  cursor: "pointer"
}

const overdueBadge = {
  position: "absolute",
  top: 8,
  right: 8,
  zIndex: 2,
  background: "#dc2626",
  color: "white",
  padding: "4px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 900
}