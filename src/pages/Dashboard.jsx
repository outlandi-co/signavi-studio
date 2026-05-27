import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"
import { useNavigate } from "react-router-dom"
import { io } from "socket.io-client"

import api from "../services/api"

import {
  SummaryBar,
  ProfitAlerts,
  TopJobs
} from "../components/ProductionUI"

import RevenueChart from "../components/charts/RevenueChart"
import ProductChart from "../components/charts/ProductChart"

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const SOCKET_URL = API_URL.replace(/\/api\/?$/, "")

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const normalizeOrders = (payload) => {
  const data =
    payload?.data ||
    payload?.orders ||
    payload ||
    []

  return Array.isArray(data) ? data : []
}

const normalizeAnalytics = (payload) => {
  return payload?.data || payload || {}
}

const normalizeJobs = (data) => {
  if (!data) return {}
  if (!Array.isArray(data)) return data

  return data.reduce(
    (grouped, job) => {
      const status = job.status || "pending"

      if (!grouped[status]) {
        grouped[status] = []
      }

      grouped[status].push(job)

      return grouped
    },
    {
      pending: [],
      production: [],
      completed: []
    }
  )
}

function CSVButtons() {
  return (
    <div className="mb-6 flex flex-wrap gap-4">
      <button
        type="button"
        onClick={() =>
          window.open(
            "https://signavi-backend.onrender.com/api/orders/export",
            "_blank"
          )
        }
        className="rounded-xl bg-emerald-500 px-4 py-2 font-bold text-black transition hover:bg-emerald-400"
      >
        📄 Download Orders CSV
      </button>

      <button
        type="button"
        onClick={() =>
          window.open(
            "https://signavi-backend.onrender.com/api/export-taxes",
            "_blank"
          )
        }
        className="rounded-xl bg-cyan-400 px-4 py-2 font-bold text-black transition hover:bg-cyan-300"
      >
        🧾 Download Tax CSV
      </button>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const socketRef = useRef(null)
  const loadingRef = useRef(false)

  const [orders, setOrders] = useState([])
  const [jobs, setJobs] = useState({})
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState(null)

  const loadData = useCallback(async () => {
    if (loadingRef.current) return

    try {
      loadingRef.current = true
      setLoading(true)
      setError("")

      const ordersRes = await api.get("/orders")
      setOrders(normalizeOrders(ordersRes.data))

      try {
        const analyticsRes = await api.get("/orders/analytics")
        setAnalytics(normalizeAnalytics(analyticsRes.data))
      } catch (err) {
        console.warn("⚠️ Analytics not loaded:", err.message)
        setAnalytics({})
      }

      try {
        const productionRes = await api.get("/production")
        setJobs(normalizeJobs(productionRes.data))
      } catch (err) {
        console.warn("⚠️ Production not loaded:", err.message)
        setJobs({})
      }

      setLastUpdated(new Date())
    } catch (err) {
      console.error("❌ DASHBOARD LOAD ERROR:", err.response?.data || err)
      setOrders([])
      setJobs({})
      setAnalytics({})
      setError("Failed to load dashboard orders")
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData()
    }, 0)

    return () => clearTimeout(timer)
  }, [loadData])

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"]
      })
    }

    const socket = socketRef.current

    socket.on("jobUpdated", loadData)
    socket.on("jobCreated", loadData)
    socket.on("jobDeleted", loadData)

    socket.on("orderUpdated", loadData)
    socket.on("orderCreated", loadData)
    socket.on("orderDeleted", loadData)

    socket.on("quoteUpdated", loadData)
    socket.on("quoteCreated", loadData)

    return () => {
      socket.off("jobUpdated", loadData)
      socket.off("jobCreated", loadData)
      socket.off("jobDeleted", loadData)

      socket.off("orderUpdated", loadData)
      socket.off("orderCreated", loadData)
      socket.off("orderDeleted", loadData)

      socket.off("quoteUpdated", loadData)
      socket.off("quoteCreated", loadData)
    }
  }, [loadData])

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [])

  const counts = useMemo(() => {
    return {
      quotes: orders.filter(
        (order) =>
          order.status === "quotes" ||
          order.status === "quote"
      ).length,

      payment: orders.filter(
        (order) => order.status === "payment_required"
      ).length,

      ready: orders.filter(
        (order) => order.status === "ready_for_production"
      ).length,

      production: orders.filter(
        (order) => order.status === "production"
      ).length,

      shipping: orders.filter(
        (order) => order.status === "shipping"
      ).length,

      shipped: orders.filter(
        (order) => order.status === "shipped"
      ).length,

      delivered: orders.filter(
        (order) => order.status === "delivered"
      ).length,

      total: orders.length
    }
  }, [orders])

  const alerts = useMemo(() => {
    return orders.filter((order) =>
      [
        "payment_required",
        "ready_for_production",
        "production",
        "shipping"
      ].includes(order.status)
    )
  }, [orders])

  const analyticsData = analytics || {}

  const revenue =
    analyticsData.totalRevenue ||
    analyticsData.revenue ||
    0

  const profit =
    analyticsData.totalProfit ||
    analyticsData.profit ||
    0

  const monthly =
    analyticsData.monthly ||
    analyticsData.revenueByMonth ||
    analyticsData.revenueByDay ||
    []

  const products =
    analyticsData.products ||
    analyticsData.topProducts ||
    []

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] p-6 text-white">
        <h1 className="mb-6 text-3xl font-bold">
          🚀 Dashboard
        </h1>

        <CSVButtons />

        <p className="text-slate-400">
          Loading dashboard...
        </p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#020617] p-6 text-white">
        <h1 className="mb-6 text-3xl font-bold">
          🚀 Dashboard
        </h1>

        <CSVButtons />

        <div className="rounded-3xl border border-red-500/40 bg-red-950/40 p-6 text-red-300">
          <h2 className="mb-2 text-xl font-bold">
            Error
          </h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={loadData}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 font-bold text-white transition hover:bg-red-500"
          >
            Retry
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] p-6 text-white">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              SignaVi Studio
            </p>

            <h1 className="text-4xl font-extrabold md:text-5xl">
              🚀 Dashboard
            </h1>

            <p className="mt-3 text-slate-400">
              Live production, orders, revenue, and alerts in one command center.
            </p>

            {lastUpdated && (
              <p className="mt-2 text-sm text-slate-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={loadData}
            className="rounded-full bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
          >
            🔄 Refresh Dashboard
          </button>
        </div>

        <CSVButtons />

        <SummaryBar jobs={jobs || {}} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-7">
          <Card title="Quotes" value={counts.quotes} color="text-cyan-400" />
          <Card title="Payment" value={counts.payment} color="text-purple-400" />
          <Card title="Ready" value={counts.ready} color="text-blue-400" />
          <Card title="Production" value={counts.production} color="text-yellow-400" />
          <Card title="Shipping" value={counts.shipping} color="text-green-400" />
          <Card title="Shipped" value={counts.shipped} color="text-emerald-400" />
          <Card title="Total" value={counts.total} color="text-white" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ProfitAlerts jobs={jobs || {}} />
          <TopJobs jobs={jobs || {}} />
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
          <h2 className="mb-3 text-xl font-semibold">
            💰 Revenue
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <DetailBox
              label="Total Revenue"
              value={money(revenue)}
            />

            <DetailBox
              label="Profit"
              value={money(profit)}
            />

            <DetailBox
              label="Orders"
              value={orders.length}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <RevenueChart data={monthly} />
          <ProductChart data={products} />
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
          <h2 className="mb-4 text-xl font-semibold">
            🚨 Attention Needed
          </h2>

          {alerts.length === 0 ? (
            <p className="text-emerald-300">
              All good 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {alerts.map((order) => (
                <button
                  key={order._id}
                  type="button"
                  onClick={() => navigate(`/admin/orders/${order._id}`)}
                  className="w-full rounded-2xl border border-slate-800 bg-[#020617] p-4 text-left transition hover:border-cyan-500"
                >
                  <p className="font-bold text-cyan-300">
                    #{String(order._id || "").slice(-6).toUpperCase()}
                  </p>

                  <p className="text-sm text-slate-400">
                    {order.customerName || "Customer"} — {order.status}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white transition hover:bg-blue-500"
          >
            📦 Orders
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/production")}
            className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white transition hover:bg-emerald-500"
          >
            🏭 Production
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/revenue")}
            className="rounded-xl bg-purple-600 px-4 py-2 font-bold text-white transition hover:bg-purple-500"
          >
            💰 Revenue
          </button>
        </div>
      </section>
    </main>
  )
}

function Card({ title, value, color }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/20">
      <h3 className="text-sm text-slate-400">
        {title}
      </h3>

      <p className={`mt-2 text-3xl font-black ${color}`}>
        {value}
      </p>
    </div>
  )
}

function DetailBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#020617] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-white">
        {value}
      </p>
    </div>
  )
}