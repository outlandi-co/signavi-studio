import { useEffect, useState, useRef } from "react"
import api from "../services/api"
import { useNavigate } from "react-router-dom"
import { io } from "socket.io-client"

/* 🔥 COMPONENTS */
import {
  SummaryBar,
  ProfitAlerts,
  TopJobs
} from "../components/ProductionUI"

import RevenueChart from "../components/charts/RevenueChart"
import ProductChart from "../components/charts/ProductChart"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api"
const SOCKET_URL = API_URL.replace("/api", "")

function Dashboard() {

  const [orders, setOrders] = useState([])
  const [jobs, setJobs] = useState({})
  const [analytics, setAnalytics] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const socketRef = useRef(null)
  const navigate = useNavigate()

  /* ================= LOAD ================= */
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [ordersRes, analyticsRes, productionRes] = await Promise.all([
        api.get("/orders"),
        api.get("/orders/analytics"),
        api.get("/production")
      ])

      setOrders(ordersRes.data)
      setAnalytics(analyticsRes.data)
      setJobs(productionRes.data)

    } catch (err) {
      console.error(err)
      setError("Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  /* ================= INIT ================= */
  useEffect(() => {
    loadData()
  }, [])

  /* ================= SOCKET ================= */
  useEffect(() => {
    socketRef.current = io(SOCKET_URL)

    socketRef.current.on("jobUpdated", () => {
      loadData()
    })

    return () => socketRef.current.disconnect()
  }, [])

  /* ================= COUNTS ================= */
  const counts = {
    pending: orders.filter(o => o.status === "pending").length,
    payment: orders.filter(o => o.status === "payment_required").length,
    production: orders.filter(o => o.status === "production").length,
    shipping: orders.filter(o => o.status === "shipping").length
  }

  /* ================= ALERTS ================= */
  const alerts = orders.filter(o =>
    o.status === "payment_required" ||
    o.status === "production"
  )

  /* ================= LOADING ================= */
  if (loading) {
    return <div className="p-6 text-white">Loading dashboard...</div>
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="p-6 text-red-400">
        <h1>Error</h1>
        <p>{error}</p>
        <button
          onClick={loadData}
          className="mt-4 bg-red-600 px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">

      <h1 className="text-3xl font-bold">🚀 Dashboard</h1>

      {/* 🔥 SUMMARY */}
      <SummaryBar jobs={jobs} />

      {/* 🔥 KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Pending" value={counts.pending} color="text-blue-400" />
        <Card title="Payment Needed" value={counts.payment} color="text-purple-400" />
        <Card title="Production" value={counts.production} color="text-yellow-400" />
        <Card title="Shipping" value={counts.shipping} color="text-green-400" />
      </div>

      {/* 🔥 ALERT + TOP JOBS */}
      <div className="grid md:grid-cols-2 gap-6">
        <ProfitAlerts jobs={jobs} />
        <TopJobs jobs={jobs} />
      </div>

      {/* 🔥 REVENUE */}
      <div className="bg-slate-900 p-4 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-2">💰 Revenue</h2>
        <p>Total Revenue: ${analytics?.totalRevenue || 0}</p>
        <p>Profit: ${analytics?.totalProfit || 0}</p>
      </div>

      {/* 🔥 CHARTS */}
      <div className="grid md:grid-cols-2 gap-6">
        <RevenueChart data={analytics?.monthly || []} />
        <ProductChart data={analytics?.products || []} />
      </div>

      {/* 🔥 FALLBACK ALERTS */}
      <div className="bg-slate-900 p-4 rounded-xl shadow">
        <h2 className="text-xl mb-2">🚨 Attention Needed</h2>

        {alerts.length === 0 && <p>All good 🎉</p>}

        {alerts.map(o => (
          <div key={o._id}>
            #{o._id.slice(-6)} — {o.status}
          </div>
        ))}
      </div>

      {/* 🔥 ACTIONS */}
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
          onClick={() => navigate("/admin/analytics")}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
        >
          📊 Analytics
        </button>
      </div>

    </div>
  )
}

/* ================= CARD ================= */
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