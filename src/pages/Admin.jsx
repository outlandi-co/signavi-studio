import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"

import {
  useNavigate
} from "react-router-dom"

import { io } from "socket.io-client"

import api from "../services/api"

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "https://signavi-backend.onrender.com"

const columns = [
  {
    title: "💳 Paid",
    status: "paid",
    color: "#facc15",
    nextStatus: "ready_for_production",
    action: "Prep"
  },
  {
    title: "🧰 Ready",
    status: "ready_for_production",
    color: "#38bdf8",
    nextStatus: "production",
    action: "Start"
  },
  {
    title: "🏭 Production",
    status: "production",
    color: "#a78bfa",
    nextStatus: "shipping",
    action: "Complete"
  },
  {
    title: "📦 Shipping",
    status: "shipping",
    color: "#fb923c",
    nextStatus: "shipped",
    action: "Ship"
  },
  {
    title: "✅ Shipped",
    status: "shipped",
    color: "#22c55e",
    nextStatus: "delivered",
    action: "Deliver"
  }
]

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const getOrderArray = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.orders)) return data.orders

  return []
}

const getOrderTotal = (order = {}) => {
  return Number(
    order.finalPrice ||
      order.total ||
      order.price ||
      order.subtotal ||
      0
  )
}

function Admin() {
  const navigate = useNavigate()

  const socketRef = useRef(null)

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [search, setSearch] = useState("")

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)

      const res = await api.get("/orders")

      const sortedOrders = getOrderArray(res.data).sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )

      setOrders(sortedOrders)
    } catch (err) {
      console.error("❌ FETCH ORDERS ERROR:", err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders()
    }, 0)

    return () => clearTimeout(timer)
  }, [fetchOrders])

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"]
      })
    }

    const socket = socketRef.current

    const handleCreated = (order) => {
      if (!order?._id) return

      setOrders((prev) => [
        order,
        ...prev.filter(
          (item) => item._id !== order._id
        )
      ])
    }

    const handleUpdated = (updatedOrder) => {
      if (!updatedOrder?._id) return

      setOrders((prev) =>
        prev.map((order) =>
          order._id === updatedOrder._id
            ? {
                ...order,
                ...updatedOrder
              }
            : order
        )
      )
    }

    socket.on("orderCreated", handleCreated)
    socket.on("orderUpdated", handleUpdated)
    socket.on("jobUpdated", handleUpdated)

    return () => {
      socket.off("orderCreated", handleCreated)
      socket.off("orderUpdated", handleUpdated)
      socket.off("jobUpdated", handleUpdated)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [])

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id)

      let updated = null

      try {
        const res = await api.patch(`/orders/${id}/status`, {
          status
        })

        updated =
          res.data?.data ||
          res.data?.order ||
          res.data
      } catch (statusErr) {
        console.warn(
          "⚠️ /status route failed, trying general PATCH:",
          statusErr.response?.data || statusErr.message
        )

        const res = await api.patch(`/orders/${id}`, {
          status
        })

        updated =
          res.data?.data ||
          res.data?.order ||
          res.data
      }

      setOrders((prev) =>
        prev.map((order) =>
          order._id === id
            ? {
                ...order,
                ...updated,
                status
              }
            : order
        )
      )
    } catch (err) {
      console.error(
        "❌ UPDATE STATUS ERROR:",
        err.response?.data || err
      )

      setOrders((prev) =>
        prev.map((order) =>
          order._id === id
            ? {
                ...order,
                status
              }
            : order
        )
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders

    const term = search.trim().toLowerCase()

    return orders.filter((order) => {
      return [
        order._id,
        order.orderId,
        order.customerName,
        order.email,
        order.phone,
        order.status,
        order.trackingNumber
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    })
  }, [orders, search])

  const activeOrders = useMemo(() => {
    return filteredOrders.filter((order) => {
      return ![
        "delivered",
        "archive",
        "denied"
      ].includes(order.status || "")
    })
  }, [filteredOrders])

  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce(
      (sum, order) => sum + getOrderTotal(order),
      0
    )
  }, [filteredOrders])

  const getOrders = useCallback(
    (status) => {
      return filteredOrders.filter(
        (order) => order.status === status
      )
    },
    [filteredOrders]
  )

  const Column = ({
    title,
    status,
    color,
    nextStatus,
    action
  }) => {
    const columnOrders = getOrders(status)

    const columnRevenue = columnOrders.reduce(
      (sum, order) => sum + getOrderTotal(order),
      0
    )

    return (
      <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 shadow-xl shadow-black/20">
        <div className="mb-4 border-b border-slate-800 pb-3">
          <h3
            className="text-sm font-extrabold tracking-wide"
            style={{ color }}
          >
            {title} ({columnOrders.length})
          </h3>

          <p className="mt-1 text-xs font-bold text-slate-400">
            {money(columnRevenue)}
          </p>
        </div>

        {columnOrders.length === 0 && (
          <p className="text-xs text-slate-500">
            No orders
          </p>
        )}

        <div className="grid gap-3">
          {columnOrders.map((order) => {
            const total = getOrderTotal(order)

            return (
              <article
                key={order._id}
                className="rounded-2xl border border-slate-800 bg-[#020617] p-4 shadow-sm transition hover:border-cyan-500/70"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <strong className="text-sm text-cyan-300">
                      #
                      {String(
                        order.orderId ||
                          order._id ||
                          ""
                      )
                        .slice(-6)
                        .toUpperCase()}
                    </strong>

                    <p className="mt-1 text-sm font-bold text-white">
                      {order.customerName || "Unknown Customer"}
                    </p>

                    <p className="text-xs text-slate-500">
                      {order.email || "No email"}
                    </p>
                  </div>

                  <span className="text-xs font-bold text-emerald-300">
                    {money(total)}
                  </span>
                </div>

                <div className="mb-3 text-xs text-slate-400">
                  {order.items?.length ? (
                    order.items.slice(0, 3).map((item, index) => (
                      <p key={`${item.name || "item"}-${index}`}>
                        {item.name || "Item"} x{item.quantity || 1}
                      </p>
                    ))
                  ) : (
                    <p>No item details</p>
                  )}
                </div>

                {order.priority && (
                  <p className="mb-2 text-xs font-bold text-yellow-300">
                    Priority: {order.priority}
                  </p>
                )}

                {order.trackingNumber && (
                  <p className="mb-2 text-xs text-slate-400">
                    Tracking: {order.trackingNumber}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/admin/orders/${order._id}`)
                    }
                    className="rounded-full border border-slate-600 px-3 py-2 text-xs font-bold text-white transition hover:border-cyan-400 hover:text-cyan-300"
                  >
                    View
                  </button>

                  {nextStatus && (
                    <button
                      type="button"
                      className="rounded-full bg-cyan-500 px-3 py-2 text-xs font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={updatingId === order._id}
                      onClick={() =>
                        updateStatus(order._id, nextStatus)
                      }
                    >
                      {updatingId === order._id
                        ? "Updating..."
                        : action}
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-slate-400">
        Loading dashboard...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] p-6 text-white">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            Production Workflow
          </h1>

          <p className="mt-3 text-slate-400">
            Live updates enabled • {activeOrders.length} active orders •{" "}
            {money(totalRevenue)}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="rounded-full bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
        >
          Refresh
        </button>
      </div>

      <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search order, customer, email, status, tracking..."
          className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {columns.map((column) => (
          <Column
            key={column.status}
            {...column}
          />
        ))}
      </div>
    </main>
  )
}

export default Admin