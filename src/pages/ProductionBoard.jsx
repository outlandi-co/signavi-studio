import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react"

import api from "../services/api"
import { getSocket } from "../services/socket"
import toast from "react-hot-toast"

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable
} from "@dnd-kit/core"

import JobCard from "../components/JobCard"

/* =========================================================
   ORDER WORKFLOW
========================================================= */

const ORDER_STATUSES = [
  "payment_required",
  "paid",
  "production",
  "pickup_shipping",
  "shipping",
  "shipped",
  "delivered",
  "completed"
]

const COMPLETED_QUOTE_STATUSES = [
  "payment_required",
  "paid",
  "production",
  "pickup_shipping",
  "shipping",
  "shipped",
  "delivered",
  "completed",
  "denied",
  "archive"
]

const columnLabels = {
  quotes: "Quotes",
  payment_required: "Payment Required",
  paid: "Paid",
  production: "Production",
  pickup_shipping: "Pickup / Shipping",
  shipping: "Shipping",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed"
}

/* =========================================================
   HELPERS
========================================================= */

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const getJobValue = (job = {}) => {
  return Number(
    job.finalPrice ??
      job.total ??
      job.totalPrice ??
      job.price ??
      job.subtotal ??
      0
  )
}

const searchJob = (job = {}, term = "") => {
  if (!term.trim()) {
    return true
  }

  const haystack = [
    job._id,
    job.customerName,
    job.name,
    job.email,
    job.phone,
    job.status,
    job.source,
    job.recordType,
    job.orderType,
    job.invoiceNumber,
    job.trackingNumber,
    job.priority,
    job.adminNotes,
    job.notes,
    job.serviceType,
    job.serviceLabel,
    job.printType
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return haystack.includes(
    term.trim().toLowerCase()
  )
}

const isOverdue = (job = {}) => {
  if (!job.dueDate) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(job.dueDate)

  if (
    Number.isNaN(due.getTime())
  ) {
    return false
  }

  due.setHours(0, 0, 0, 0)

  return due < today
}

const isHighPriority = (job = {}) => {
  return job.priority === "high"
}

const isDueThisWeek = (job = {}) => {
  if (!job.dueDate) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(job.dueDate)

  if (
    Number.isNaN(due.getTime())
  ) {
    return false
  }

  due.setHours(0, 0, 0, 0)

  const diffDays =
    (due.getTime() -
      today.getTime()) /
    (1000 * 60 * 60 * 24)

  return (
    diffDays >= 0 &&
    diffDays <= 7
  )
}

const sortProductionJobs = (
  jobs = []
) => {
  return [...jobs].sort(
    (a, b) => {
      const aOverdue =
        isOverdue(a) ? 1 : 0

      const bOverdue =
        isOverdue(b) ? 1 : 0

      if (
        aOverdue !== bOverdue
      ) {
        return (
          bOverdue -
          aOverdue
        )
      }

      const priorityRank = {
        high: 3,
        medium: 2,
        low: 1
      }

      const aPriority =
        priorityRank[
          a.priority ||
            "medium"
        ] || 2

      const bPriority =
        priorityRank[
          b.priority ||
            "medium"
        ] || 2

      if (
        aPriority !==
        bPriority
      ) {
        return (
          bPriority -
          aPriority
        )
      }

      const aDue =
        a.dueDate
          ? new Date(
              a.dueDate
            ).getTime()
          : Number.MAX_SAFE_INTEGER

      const bDue =
        b.dueDate
          ? new Date(
              b.dueDate
            ).getTime()
          : Number.MAX_SAFE_INTEGER

      return aDue - bDue
    }
  )
}

/* =========================================================
   DRAGGABLE ORDER CARD
========================================================= */

function DraggableJobCard({
  job
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: job._id,
    data: {
      jobId: job._id,
      recordType:
        job.recordType
    }
  })

  const transformStyle =
    transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined

  return (
    <div
      ref={setNodeRef}
      style={{
        transform:
          transformStyle,
        opacity:
          isDragging
            ? 0.65
            : 1,
        position:
          "relative",
        zIndex:
          isDragging
            ? 50
            : 1,
        cursor: "grab",
        touchAction:
          "none"
      }}
      {...listeners}
      {...attributes}
    >
      {isOverdue(job) && (
        <div
          style={overdueBadge}
        >
          ⚠️ Overdue
        </div>
      )}

      <JobCard
        job={job}
        isQuoteCard={false}
      />
    </div>
  )
}

/* =========================================================
   BOARD COLUMN
========================================================= */

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

  const columnRevenue =
    jobs.reduce(
      (sum, job) =>
        sum +
        getJobValue(job),
      0
    )

  return (
    <div
      ref={setNodeRef}
      style={{
        width:
          isMobile
            ? "100%"
            : 320,

        maxWidth:
          isMobile
            ? "100%"
            : 320,

        minWidth: 0,

        minHeight:
          isMobile
            ? 360
            : 600,

        background:
          isOver
            ? "#172554"
            : "rgba(15, 23, 42, 0.9)",

        padding:
          isMobile
            ? 12
            : 16,

        boxSizing:
          "border-box",

        borderRadius: 22,

        border:
          isOver
            ? "1px solid #38bdf8"
            : "1px solid #1e293b",

        boxShadow:
          "0 16px 40px rgba(0,0,0,.28)",

        flexShrink: 0,

        transition:
          "all .2s ease"
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          marginBottom: 16,
          paddingBottom: 12,

          borderBottom:
            "1px solid #1e293b",

          background:
            isOver
              ? "#172554"
              : "rgba(15, 23, 42, 0.95)"
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
          {columnLabels[id] ||
            id.replaceAll(
              "_",
              " "
            )}

          <span
            style={{
              marginLeft: 8,
              color:
                "#67e8f9"
            }}
          >
            ({jobs.length})
          </span>
        </h3>

        <p
          style={{
            margin:
              "8px 0 0",

            color:
              "#94a3b8",

            fontSize: 12,
            fontWeight: 700
          }}
        >
          {money(
            columnRevenue
          )}
        </p>
      </div>

      {jobs.length === 0 ? (
        <p
          style={{
            color:
              "#64748b",
            fontSize: 14,
            margin: 0
          }}
        >
          No jobs in this
          column
        </p>
      ) : (
        jobs.map(
          (job) => (
            <DraggableJobCard
              key={job._id}
              job={job}
            />
          )
        )
      )}
    </div>
  )
}

/* =========================================================
   PRODUCTION BOARD
========================================================= */

export default function ProductionBoard() {
  const [jobs, setJobs] =
    useState([])

  const [
    loading,
    setLoading
  ] = useState(false)

  const [
    search,
    setSearch
  ] = useState("")

  const [
    viewFilter,
    setViewFilter
  ] = useState("all")

  const [
    isMobile,
    setIsMobile
  ] = useState(
    () =>
      window.innerWidth <=
      900
  )

  /* =====================================================
     RESPONSIVE
  ===================================================== */

  useEffect(() => {
    const handleResize =
      () => {
        setIsMobile(
          window.innerWidth <=
            900
        )
      }

    handleResize()

    window.addEventListener(
      "resize",
      handleResize
    )

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      )
    }
  }, [])

  /* =====================================================
     DRAG SENSOR
  ===================================================== */

  const sensors =
    useSensors(
      useSensor(
        PointerSensor,
        {
          activationConstraint:
            {
              distance: 8
            }
        }
      )
    )

  /* =====================================================
     QUOTE DETECTION
  ===================================================== */

  const isPendingQuote =
    useCallback(
      (quote = {}) => {
        const approvalStatus =
          quote.approvalStatus ||
          "pending"

        const quoteStatus =
          quote.status ||
          "quotes"

        return (
          approvalStatus ===
            "pending" &&
          !COMPLETED_QUOTE_STATUSES.includes(
            quoteStatus
          )
        )
      },
      []
    )

  /* =====================================================
     NORMALIZATION
  ===================================================== */

  const normalizeOrder =
    useCallback(
      (order) => ({
        ...order,

        /*
         * IMPORTANT:
         *
         * source may legitimately
         * equal "quote" for an Order
         * created from an approved
         * quote.
         *
         * recordType tells the board
         * whether this Mongo record is
         * a Quote or an Order.
         */
        recordType:
          "order",

        source:
          order.source ||
          "store"
      }),
      []
    )

  const normalizeQuote =
    useCallback(
      (quote) => ({
        ...quote,
        status: "quotes",
        recordType:
          "quote",
        source:
          quote.source ||
          "quote"
      }),
      []
    )

  /* =====================================================
     LOAD ORDERS + QUOTES
  ===================================================== */

  const load =
    useCallback(
      async () => {
        try {
          setLoading(true)

          const [
            ordersRes,
            quotesRes
          ] =
            await Promise.all([
              api.get(
                "/orders"
              ),

              api
                .get(
                  "/quotes"
                )
                .catch(
                  () => ({
                    data: {
                      data: []
                    }
                  })
                )
            ])

          const orders =
            Array.isArray(
              ordersRes.data
            )
              ? ordersRes.data
              : ordersRes.data
                  ?.data || []

          const quotes =
            Array.isArray(
              quotesRes.data
            )
              ? quotesRes.data
              : quotesRes.data
                  ?.data || []

          const pendingQuotes =
            quotes.filter(
              isPendingQuote
            )

          const merged = [
            ...pendingQuotes.map(
              normalizeQuote
            ),

            ...orders.map(
              normalizeOrder
            )
          ]

          setJobs(merged)
        } catch (err) {
          console.error(
            "❌ LOAD ERROR:",
            err.response
              ?.data || err
          )

          toast.error(
            "Could not load production board"
          )
        } finally {
          setLoading(false)
        }
      },
      [
        isPendingQuote,
        normalizeOrder,
        normalizeQuote
      ]
    )

  useEffect(() => {
    const timer =
      setTimeout(
        () => {
          load()
        },
        0
      )

    return () =>
      clearTimeout(timer)
  }, [load])

  /* =====================================================
     SOCKET UPDATES
  ===================================================== */

  useEffect(() => {
    let socket

    const init =
      async () => {
        socket =
          await getSocket()

        if (!socket) {
          return
        }

        socket.on(
          "orderCreated",
          load
        )

        socket.on(
          "orderUpdated",
          load
        )

        socket.on(
          "jobCreated",
          load
        )

        socket.on(
          "jobUpdated",
          load
        )

        socket.on(
          "quoteUpdated",
          load
        )

        socket.on(
          "pricingUpdated",
          load
        )
      }

    init()

    return () => {
      socket?.off(
        "orderCreated",
        load
      )

      socket?.off(
        "orderUpdated",
        load
      )

      socket?.off(
        "jobCreated",
        load
      )

      socket?.off(
        "jobUpdated",
        load
      )

      socket?.off(
        "quoteUpdated",
        load
      )

      socket?.off(
        "pricingUpdated",
        load
      )
    }
  }, [load])

  /* =====================================================
     REMOVE QUOTE LOCALLY
  ===================================================== */

  const removeQuoteFromBoard =
    (quoteId) => {
      setJobs(
        (prev) =>
          prev.filter(
            (job) =>
              !(
                job._id ===
                  quoteId &&
                job.recordType ===
                  "quote"
              )
          )
      )
    }

  /* =====================================================
     REFRESH ORDERS ONLY
  ===================================================== */

  const refreshOrdersOnly =
    async () => {
      try {
        const ordersRes =
          await api.get(
            "/orders"
          )

        const orders =
          Array.isArray(
            ordersRes.data
          )
            ? ordersRes.data
            : ordersRes.data
                ?.data || []

        setJobs(
          (prev) => {
            const remainingQuotes =
              prev.filter(
                (job) =>
                  job.recordType ===
                  "quote"
              )

            return [
              ...remainingQuotes,

              ...orders.map(
                normalizeOrder
              )
            ]
          }
        )
      } catch (err) {
        console.error(
          "❌ REFRESH ORDERS ERROR:",
          err.response?.data ||
            err
        )
      }
    }

  /* =====================================================
     APPROVE QUOTE
  ===================================================== */

  const handleApprove =
    async (job) => {
      const finalPrice =
        Number(
          job.finalPrice ??
            job.price ??
            0
        )

      if (
        !Number.isFinite(
          finalPrice
        ) ||
        finalPrice <= 0
      ) {
        toast.error(
          "Enter a valid final quote price"
        )

        return
      }

      try {
        /*
         * Remove the pending
         * quote card immediately.
         */
        removeQuoteFromBoard(
          job._id
        )

        /*
         * IMPORTANT:
         *
         * DO NOT send:
         *
         * status: "approved"
         *
         * "approved" is an
         * approvalStatus, not a
         * valid Quote.status.
         *
         * The backend handles
         * creating the resulting
         * Order with status
         * payment_required.
         */
        await api.patch(
          `/quotes/${job._id}`,
          {
            approvalStatus:
              "approved",

            finalPrice,

            price:
              finalPrice
          }
        )

        await refreshOrdersOnly()

        toast.success(
          "Quote approved — awaiting payment"
        )

        console.log(
          "✅ QUOTE APPROVED"
        )
      } catch (err) {
        console.error(
          "❌ APPROVE ERROR:",
          err.response?.data ||
            err
        )

        toast.error(
          err.response?.data
            ?.message ||
            "Could not approve quote"
        )

        /*
         * Restore board from
         * server if approval fails.
         */
        await load()
      }
    }

  /* =====================================================
     DENY QUOTE
  ===================================================== */

  const handleDeny =
    async (job) => {
      try {
        removeQuoteFromBoard(
          job._id
        )

        await api.patch(
          `/quotes/${job._id}`,
          {
            approvalStatus:
              "denied",

            status:
              "denied"
          }
        )

        toast.success(
          "Quote denied"
        )

        console.log(
          "❌ QUOTE DENIED"
        )
      } catch (err) {
        console.error(
          "❌ DENY ERROR:",
          err.response?.data ||
            err
        )

        toast.error(
          err.response?.data
            ?.message ||
            "Could not deny quote"
        )

        await load()
      }
    }

  /* =====================================================
     DRAG ORDER TO NEW STATUS
  ===================================================== */

  const handleDragEnd =
    async ({
      active,
      over
    }) => {
      if (!over) {
        return
      }

      const jobId =
        active.id

      const columnId =
        over?.data?.current
          ?.columnId

      if (
        !ORDER_STATUSES.includes(
          columnId
        )
      ) {
        return
      }

      const draggedJob =
        jobs.find(
          (job) =>
            job._id ===
            jobId
        )

      if (!draggedJob) {
        return
      }

      /*
       * Pending Quote records
       * cannot be dragged into
       * production.
       *
       * Approved quotes become
       * Order records first.
       */
      if (
        draggedJob.recordType ===
        "quote"
      ) {
        return
      }

      /*
       * Do nothing when dropped
       * into its current status.
       */
      if (
        draggedJob.status ===
        columnId
      ) {
        return
      }

      try {
        /*
         * Optimistic update.
         */
        setJobs(
          (prev) =>
            prev.map(
              (job) =>
                job._id ===
                jobId
                  ? {
                      ...job,
                      status:
                        columnId
                    }
                  : job
            )
        )

        await api.patch(
          `/orders/${jobId}`,
          {
            status:
              columnId
          }
        )

        toast.success(
          `Moved to ${
            columnLabels[
              columnId
            ] ||
            columnId.replaceAll(
              "_",
              " "
            )
          }`
        )
      } catch (err) {
        console.error(
          "❌ DRAG ERROR:",
          err.response?.data ||
            err
        )

        toast.error(
          err.response?.data
            ?.message ||
            "Could not update order status"
        )

        await load()
      }
    }

  /* =====================================================
     FILTER + SORT
  ===================================================== */

  const filteredJobs =
    useMemo(() => {
      let data =
        jobs.filter(
          (job) =>
            searchJob(
              job,
              search
            )
        )

      if (
        viewFilter ===
        "high"
      ) {
        data =
          data.filter(
            isHighPriority
          )
      }

      if (
        viewFilter ===
        "overdue"
      ) {
        data =
          data.filter(
            isOverdue
          )
      }

      if (
        viewFilter ===
        "week"
      ) {
        data =
          data.filter(
            isDueThisWeek
          )
      }

      return sortProductionJobs(
        data
      )
    }, [
      jobs,
      search,
      viewFilter
    ])

  /* =====================================================
     GROUP BOARD COLUMNS
  ===================================================== */

  const grouped =
    useMemo(() => {
      return {
        quotes:
          filteredJobs.filter(
            (job) =>
              job.recordType ===
                "quote" &&
              isPendingQuote(
                job
              )
          ),

        payment_required:
          filteredJobs.filter(
            (job) =>
              job.recordType ===
                "order" &&
              job.status ===
                "payment_required"
          ),

        paid:
          filteredJobs.filter(
            (job) =>
              job.recordType ===
                "order" &&
              job.status ===
                "paid"
          ),

        /*
         * ready_for_production
         * is legacy support only.
         *
         * Existing old records
         * will appear under
         * Production rather than
         * disappearing.
         */
        production:
          filteredJobs.filter(
            (job) =>
              job.recordType ===
                "order" &&
              [
                "production",
                "ready_for_production"
              ].includes(
                job.status
              )
          ),

        pickup_shipping:
          filteredJobs.filter(
            (job) =>
              job.recordType ===
                "order" &&
              job.status ===
                "pickup_shipping"
          ),

        shipping:
          filteredJobs.filter(
            (job) =>
              job.recordType ===
                "order" &&
              job.status ===
                "shipping"
          ),

        shipped:
          filteredJobs.filter(
            (job) =>
              job.recordType ===
                "order" &&
              job.status ===
                "shipped"
          ),

        delivered:
          filteredJobs.filter(
            (job) =>
              job.recordType ===
                "order" &&
              job.status ===
                "delivered"
          ),

        completed:
          filteredJobs.filter(
            (job) =>
              job.recordType ===
                "order" &&
              job.status ===
                "completed"
          )
      }
    }, [
      filteredJobs,
      isPendingQuote
    ])

  const boardColumns = [
    [
      "payment_required",
      grouped.payment_required
    ],

    [
      "paid",
      grouped.paid
    ],

    [
      "production",
      grouped.production
    ],

    [
      "pickup_shipping",
      grouped.pickup_shipping
    ],

    [
      "shipping",
      grouped.shipping
    ],

    [
      "shipped",
      grouped.shipped
    ],

    [
      "delivered",
      grouped.delivered
    ],

    [
      "completed",
      grouped.completed
    ]
  ]

  /* =====================================================
     METRICS
  ===================================================== */

  const allOrderJobs =
    filteredJobs.filter(
      (job) =>
        job.recordType ===
        "order"
    )

  const totalRevenue =
    allOrderJobs.reduce(
      (sum, job) =>
        sum +
        getJobValue(job),
      0
    )

  const pendingPaymentRevenue =
    grouped.payment_required.reduce(
      (sum, job) =>
        sum +
        getJobValue(job),
      0
    )

  const paidRevenue =
    grouped.paid.reduce(
      (sum, job) =>
        sum +
        getJobValue(job),
      0
    )

  const productionRevenue =
    grouped.production.reduce(
      (sum, job) =>
        sum +
        getJobValue(job),
      0
    )

  const shippedRevenue =
    grouped.shipped.reduce(
      (sum, job) =>
        sum +
        getJobValue(job),
      0
    )

  const completedRevenue =
    grouped.completed.reduce(
      (sum, job) =>
        sum +
        getJobValue(job),
      0
    )

  const averageOrder =
    allOrderJobs.length > 0
      ? totalRevenue /
        allOrderJobs.length
      : 0

  const overdueJobs =
    allOrderJobs.filter(
      isOverdue
    )

  const highPriorityJobs =
    allOrderJobs.filter(
      isHighPriority
    )

  const dueThisWeekJobs =
    allOrderJobs.filter(
      isDueThisWeek
    )

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,

        padding:
          isMobile
            ? "18px 14px 90px"
            : 24,

        boxSizing:
          "border-box",

        overflowX:
          "hidden",

        background:
          "radial-gradient(circle at top right, rgba(6,182,212,.12), transparent 35%), #020617",

        minHeight:
          "100vh"
      }}
    >
      {/* HEADER */}

      <div
        style={{
          marginBottom: 28
        }}
      >
        <p
          style={{
            color:
              "#67e8f9",

            textTransform:
              "uppercase",

            letterSpacing:
              ".18em",

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

            fontSize:
              isMobile
                ? 38
                : 42,

            lineHeight: 1.02,

            overflowWrap:
              "anywhere",

            fontWeight: 800,

            margin: 0
          }}
        >
          Production Board
        </h1>

        <p
          style={{
            color:
              "#94a3b8",

            marginTop: 10,

            maxWidth: 720
          }}
        >
          Track quotes,
          payments,
          production,
          pickup,
          shipping and
          completed orders
          from one organized
          workflow.
        </p>
      </div>

      {/* PRIMARY METRICS */}

      <div
        style={{
          ...metricGrid,

          gridTemplateColumns:
            isMobile
              ? "minmax(0, 1fr)"
              : metricGrid.gridTemplateColumns
        }}
      >
        <MetricCard
          value={
            grouped.quotes
              .length
          }
          label="Pending Quotes"
          color="#67e8f9"
        />

        <MetricCard
          value={
            grouped
              .payment_required
              .length
          }
          label="Awaiting Payment"
          color="#facc15"
        />

        <MetricCard
          value={
            grouped.paid
              .length
          }
          label="Paid"
          color="#22c55e"
        />

        <MetricCard
          value={
            grouped.production
              .length
          }
          label="In Production"
          color="#38bdf8"
        />
      </div>

      {/* WORKFLOW METRICS */}

      <div
        style={{
          ...metricGrid,

          gridTemplateColumns:
            isMobile
              ? "minmax(0, 1fr)"
              : metricGrid.gridTemplateColumns
        }}
      >
        <MetricCard
          value={
            grouped
              .pickup_shipping
              .length
          }
          label="Pickup / Shipping"
          color="#a78bfa"
        />

        <MetricCard
          value={
            grouped.shipping
              .length
          }
          label="Shipping"
          color="#38bdf8"
        />

        <MetricCard
          value={
            grouped.shipped
              .length
          }
          label="Shipped"
          color="#22c55e"
        />

        <MetricCard
          value={
            grouped.completed
              .length
          }
          label="Completed"
          color="#10b981"
        />
      </div>

      {/* PRIORITY METRICS */}

      <div
        style={{
          ...metricGrid,

          gridTemplateColumns:
            isMobile
              ? "minmax(0, 1fr)"
              : metricGrid.gridTemplateColumns
        }}
      >
        <MetricCard
          value={
            highPriorityJobs.length
          }
          label="High Priority"
          color="#ef4444"
        />

        <MetricCard
          value={
            overdueJobs.length
          }
          label="Overdue"
          color="#f97316"
        />

        <MetricCard
          value={
            dueThisWeekJobs.length
          }
          label="Due This Week"
          color="#facc15"
        />

        <MetricCard
          value={money(
            totalRevenue
          )}
          label="Board Revenue"
          color="#22c55e"
        />
      </div>

      {/* REVENUE METRICS */}

      <div
        style={{
          ...metricGrid,

          gridTemplateColumns:
            isMobile
              ? "minmax(0, 1fr)"
              : metricGrid.gridTemplateColumns
        }}
      >
        <MetricCard
          value={money(
            pendingPaymentRevenue
          )}
          label="Awaiting Payment Value"
          color="#facc15"
        />

        <MetricCard
          value={money(
            paidRevenue
          )}
          label="Paid Revenue"
          color="#22c55e"
        />

        <MetricCard
          value={money(
            productionRevenue
          )}
          label="Production Revenue"
          color="#38bdf8"
        />

        <MetricCard
          value={money(
            shippedRevenue
          )}
          label="Shipped Revenue"
          color="#a78bfa"
        />

        <MetricCard
          value={money(
            completedRevenue
          )}
          label="Completed Revenue"
          color="#10b981"
        />

        <MetricCard
          value={money(
            averageOrder
          )}
          label="Average Order"
          color="#f97316"
        />
      </div>

      {/* SEARCH TOOLBAR */}

      <div
        style={{
          ...toolbar,

          gridTemplateColumns:
            isMobile
              ? "minmax(0, 1fr)"
              : toolbar.gridTemplateColumns,

          gap:
            isMobile
              ? 10
              : 14
        }}
      >
        <input
          value={search}
          onChange={(
            event
          ) =>
            setSearch(
              event.target
                .value
            )
          }
          placeholder="Search customer, email, order, tracking, service, notes..."
          style={
            searchInput
          }
        />

        <select
          value={
            viewFilter
          }
          onChange={(
            event
          ) =>
            setViewFilter(
              event.target
                .value
            )
          }
          style={
            searchInput
          }
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
          disabled={
            loading
          }
          style={{
            ...refreshButton,

            width:
              "100%",

            minHeight: 50,

            padding:
              "14px 16px",

            opacity:
              loading
                ? 0.6
                : 1
          }}
        >
          {loading
            ? "Loading..."
            : "Refresh"}
        </button>
      </div>

      {loading && (
        <p
          style={{
            color:
              "#94a3b8",

            marginBottom: 18
          }}
        >
          Loading board...
        </p>
      )}

      {/* PRODUCTION WORKFLOW */}

      <DndContext
        sensors={
          sensors
        }
        collisionDetection={
          closestCenter
        }
        onDragEnd={
          handleDragEnd
        }
      >
        <div
          style={{
            display:
              isMobile
                ? "grid"
                : "flex",

            gridTemplateColumns:
              isMobile
                ? "minmax(0, 1fr)"
                : undefined,

            gap:
              isMobile
                ? 14
                : 24,

            width:
              "100%",

            minWidth: 0,

            overflowX:
              isMobile
                ? "hidden"
                : "auto",

            paddingBottom:
              30,

            alignItems:
              "flex-start"
          }}
        >
          {/* QUOTES COLUMN */}

          <div
            style={{
              width:
                isMobile
                  ? "100%"
                  : 320,

              maxWidth:
                isMobile
                  ? "100%"
                  : 320,

              minWidth: 0,

              minHeight:
                isMobile
                  ? 360
                  : 600,

              background:
                "rgba(15, 23, 42, 0.9)",

              padding:
                isMobile
                  ? 12
                  : 16,

              boxSizing:
                "border-box",

              borderRadius:
                22,

              border:
                "1px solid #1e293b",

              boxShadow:
                "0 16px 40px rgba(0,0,0,.28)",

              flexShrink: 0
            }}
          >
            <div
              style={{
                marginBottom:
                  16,

                paddingBottom:
                  12,

                borderBottom:
                  "1px solid #1e293b"
              }}
            >
              <h3
                style={{
                  color:
                    "white",

                  fontSize:
                    16,

                  fontWeight:
                    800,

                  margin: 0
                }}
              >
                Quotes

                <span
                  style={{
                    marginLeft:
                      8,

                    color:
                      "#67e8f9"
                  }}
                >
                  (
                  {
                    grouped
                      .quotes
                      .length
                  }
                  )
                </span>
              </h3>

              <p
                style={{
                  margin:
                    "8px 0 0",

                  color:
                    "#94a3b8",

                  fontSize:
                    12,

                  fontWeight:
                    700
                }}
              >
                Pending admin
                review
              </p>
            </div>

            {grouped.quotes
              .length ===
              0 && (
              <p
                style={{
                  color:
                    "#64748b",

                  fontSize:
                    14,

                  margin: 0
                }}
              >
                No pending
                quotes
              </p>
            )}

            {grouped.quotes.map(
              (job) => (
                <JobCard
                  key={
                    job._id
                  }
                  job={job}
                  onApprove={
                    handleApprove
                  }
                  onDeny={
                    handleDeny
                  }
                  isQuoteCard={
                    true
                  }
                />
              )
            )}
          </div>

          {/* ORDER COLUMNS */}

          {boardColumns.map(
            ([
              column,
              list
            ]) => (
              <DropColumn
                key={
                  column
                }
                id={
                  column
                }
                jobs={
                  list
                }
                isMobile={
                  isMobile
                }
              />
            )
          )}

        </div>
      </DndContext>
    </div>
  )
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  value,
  label,
  color
}) {
  return (
    <div
      style={
        cardStyle
      }
    >
      <h2
        style={{
          margin: 0,

          fontSize:
            32,

          overflowWrap:
            "anywhere",

          color
        }}
      >
        {value}
      </h2>

      <p
        style={{
          margin:
            "8px 0 0",

          color:
            "#94a3b8"
        }}
      >
        {label}
      </p>
    </div>
  )
}

/* =========================================================
   STYLES
========================================================= */

const cardStyle = {
  width: "100%",
  minWidth: 0,
  boxSizing:
    "border-box",

  background:
    "rgba(15, 23, 42, 0.85)",

  border:
    "1px solid #1e293b",

  borderRadius: 18,

  padding: 20,

  color: "white",

  boxShadow:
    "0 14px 35px rgba(0,0,0,.25)"
}

const metricGrid = {
  display: "grid",

  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",

  gap: 16,

  marginBottom: 18
}

const toolbar = {
  display: "grid",

  gridTemplateColumns:
    "1fr 220px 140px",

  gap: 14,

  width: "100%",

  minWidth: 0,

  marginBottom: 24
}

const searchInput = {
  width: "100%",

  boxSizing:
    "border-box",

  padding:
    "14px 16px",

  borderRadius: 16,

  border:
    "1px solid #334155",

  background:
    "#020617",

  color: "white",

  outline: "none",

  fontWeight: 700,

  minWidth: 0
}

const refreshButton = {
  width: "100%",

  boxSizing:
    "border-box",

  background:
    "#22d3ee",

  color:
    "#020617",

  border: "none",

  borderRadius:
    16,

  fontWeight: 900,

  cursor: "pointer"
}

const overdueBadge = {
  position:
    "absolute",

  top: 8,

  right: 8,

  zIndex: 10,

  background:
    "#dc2626",

  color:
    "white",

  padding:
    "4px 8px",

  borderRadius:
    999,

  fontSize:
    11,

  fontWeight:
    900,

  pointerEvents:
    "none"
}