import { useEffect, useState, useRef, useCallback } from "react"
import api from "../services/api"
import { useNavigate } from "react-router-dom"
import { io } from "socket.io-client"

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

const SOCKET_URL = API_URL.replace("/api", "")

const normalizeJobs = (data) => {
  if (!data) return {}
  if (!Array.isArray(data)) return data

  const grouped = {
    pending: [],
    production: [],
    completed: []
  }

  data.forEach(job => {
    if (job.status === "production") grouped.production.push(job)
    else if (job.status === "completed") grouped.completed.push(job)
    else grouped.pending.push(job)
  })

  return grouped
}

function CSVButtons() {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <button
        onClick={() =>
          window.open(
            "https://signavi-backend.onrender.com/api/orders/export",
            "_blank"
          )
        }
        className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded-xl"
      >
        📄 Download Orders CSV
      </button>

      <button
        onClick={() =>
          window.open(
            "https://signavi-backend.onrender.com/api/export-taxes",
            "_blank"
          )
        }
        className="bg-cyan-400 hover:bg-cyan-500 text-black font-bold px-4 py-2 rounded-xl"
      >
        🧾 Download Tax CSV
      </button>
    </div>
  )
}

function Dashboard() {
  const [orders, setOrders] = useState([])
  const [jobs, setJobs] = useState({})
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const socketRef = useRef(null)
  const navigate = useNavigate()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const ordersRes = await api.get("/orders")

      const safeOrders = Array.isArray(ordersRes.data)
        ? ordersRes.data
        : Array.isArray(ordersRes.data?.data)
          ? ordersRes.data.data
          : []

      setOrders(safeOrders)

      try {
        const analyticsRes = await api.get("/orders/analytics")
        setAnalytics(analyticsRes.data || null)
      } catch (err) {
        console.warn("⚠️ Analytics not loaded:", err.message)
        setAnalytics(null)
      }

      try {
        const productionRes = await api.get("/production")
        setJobs(normalizeJobs(productionRes.data))
      } catch (err) {
        console.warn("⚠️ Production not loaded:", err.message)
        setJobs({})
      }

    } catch (err) {
      console.error("❌ DASHBOARD LOAD ERROR:", err)
      setError("Failed to load dashboard orders")
    } finally {
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

    return () => {
      socket.off("jobUpdated", loadData)
      socket.off("jobCreated", loadData)
      socket.off("jobDeleted", loadData)
      socket.disconnect()
      socketRef.current = null
    }
  }, [loadData])

  const counts = {
    pending: orders.filter(order => order.status === "pending").length,
    payment: orders.filter(order => order.status === "payment_required").length,
    production: orders.filter(order => order.status === "production").length,
    shipping: orders.filter(order => order.status === "shipping").length
  }

  const alerts = orders.filter(order =>
    order.status === "payment_required" ||
    order.status === "production"
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <h1 className="text-3xl font-bold mb-6">🚀 Dashboard</h1>
        <CSVButtons />
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <h1 className="text-3xl font-bold mb-6">🚀 Dashboard</h1>
        <CSVButtons />

        <div className="text-red-400">
          <h2>Error</h2>
          <p>{error}</p>

          <button
            onClick={loadData}
            className="mt-4 bg-red-600 px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold">🚀 Dashboard</h1>

      <CSVButtons />

      <SummaryBar jobs={jobs || {}} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Pending" value={counts.pending} color="text-blue-400" />
        <Card title="Payment Needed" value={counts.payment} color="text-purple-400" />
        <Card title="Production" value={counts.production} color="text-yellow-400" />
        <Card title="Shipping" value={counts.shipping} color="text-green-400" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ProfitAlerts jobs={jobs || {}} />
        <TopJobs jobs={jobs || {}} />
      </div>

      <div className="bg-slate-900 p-4 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-2">💰 Revenue</h2>
        <p>Total Revenue: ${analytics?.totalRevenue || 0}</p>
        <p>Profit: ${analytics?.totalProfit || 0}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <RevenueChart data={analytics?.monthly || []} />
        <ProductChart data={analytics?.products || []} />
      </div>

      <div className="bg-slate-900 p-4 rounded-xl shadow">
        <h2 className="text-xl mb-2">🚨 Attention Needed</h2>

        {alerts.length === 0 && <p>All good 🎉</p>}

        {alerts.map(order => (
          <div key={order._id}>
            #{order._id.slice(-6)} — {order.status}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => navigate("/admin/orders")}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          📦 Orders
        </button>

        <button
          onClick={() => navigate("/admin/production")}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          🏭 Production
        </button>

        <button
          onClick={() => navigate("/admin/revenue")}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
        >
          💰 Revenue
        </button>
      </div>
    </div>
  )
}

function Card({ title, value, color }) {
  return (
    <div className="bg-slate-900 p-4 rounded-xl shadow">
      <h3 className="text-gray-400 text-sm">{title}</h3>
      <p className={`text-2xl font-bold ${color}`}>
        {value}
      </p>
    </div>
  )
}

export default Dashboard