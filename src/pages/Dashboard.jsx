import { useEffect, useState, useRef, useCallback } from "react"
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

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const SOCKET_URL = API_URL.replace("/api", "")

/* ================= NORMALIZE ================= */

const normalizeJobs = (data) => {

  if (!data) return {}

  if (!Array.isArray(data)) return data

  const grouped = {
    pending: [],
    production: [],
    completed: []
  }

  data.forEach(j => {

    if (j.status === "production") {
      grouped.production.push(j)

    } else if (j.status === "completed") {
      grouped.completed.push(j)

    } else {
      grouped.pending.push(j)
    }
  })

  return grouped
}

function Dashboard() {

  const [orders, setOrders] = useState([])
  const [jobs, setJobs] = useState({})
  const [analytics, setAnalytics] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const socketRef = useRef(null)

  const navigate = useNavigate()

  /* ================= LOAD ================= */

  const loadData = useCallback(async () => {

    try {

      setLoading(true)
      setError(null)

      const [
        ordersRes,
        analyticsRes,
        productionRes
      ] = await Promise.all([

        api.get("/orders"),

        api.get("/orders/analytics"),

        api.get("/production")
      ])

      const safeOrders =
        Array.isArray(ordersRes.data)
          ? ordersRes.data
          : Array.isArray(ordersRes.data?.data)
            ? ordersRes.data.data
            : []

      setOrders(safeOrders)

      setAnalytics(
        analyticsRes.data || null
      )

      setJobs(
        normalizeJobs(productionRes.data)
      )

    } catch (err) {

      console.error(
        "❌ DASHBOARD LOAD ERROR:",
        err
      )

      setError(
        "Failed to load dashboard"
      )

    } finally {

      setLoading(false)
    }

  }, [])

  /* ================= INIT ================= */

 useEffect(() => {
  const timer = setTimeout(() => {
    loadData()
  }, 0)

  return () => clearTimeout(timer)
}, [loadData])

  /* ================= SOCKET ================= */

  useEffect(() => {

    if (!socketRef.current) {

      socketRef.current = io(
        SOCKET_URL,
        {
          transports: ["websocket"]
        }
      )
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
    }

  }, [loadData])

  /* ================= COUNTS ================= */

  const counts = {

    pending:
      orders.filter(
        o => o.status === "pending"
      ).length,

    payment:
      orders.filter(
        o => o.status === "payment_required"
      ).length,

    production:
      orders.filter(
        o => o.status === "production"
      ).length,

    shipping:
      orders.filter(
        o => o.status === "shipping"
      ).length
  }

  /* ================= ALERTS ================= */

  const alerts = orders.filter(o =>
    o.status === "payment_required" ||
    o.status === "production"
  )

  /* ================= CSV EXPORTS ================= */

  const downloadOrdersCSV = () => {

    window.open(
      "https://signavi-backend.onrender.com/api/orders/export",
      "_blank"
    )
  }

  const downloadTaxCSV = () => {

    window.open(
      "https://signavi-backend.onrender.com/api/export-taxes",
      "_blank"
    )
  }

  /* ================= LOADING ================= */

  if (loading) {

    return (
      <div className="p-6 text-white">
        Loading dashboard...
      </div>
    )
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

      <h1 className="text-3xl font-bold">
        🚀 Dashboard
      </h1>

      {/* ================= CSV EXPORTS ================= */}

      <div className="flex flex-wrap gap-4">

        <button
          onClick={downloadOrdersCSV}
          className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded-xl"
        >
          📄 Download Orders CSV
        </button>

        <button
          onClick={downloadTaxCSV}
          className="bg-cyan-400 hover:bg-cyan-500 text-black font-bold px-4 py-2 rounded-xl"
        >
          🧾 Download Tax CSV
        </button>

      </div>

      {/* ================= SUMMARY ================= */}

      <SummaryBar jobs={jobs || {}} />

      {/* ================= KPI ================= */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <Card
          title="Pending"
          value={counts.pending}
          color="text-blue-400"
        />

        <Card
          title="Payment Needed"
          value={counts.payment}
          color="text-purple-400"
        />

        <Card
          title="Production"
          value={counts.production}
          color="text-yellow-400"
        />

        <Card
          title="Shipping"
          value={counts.shipping}
          color="text-green-400"
        />

      </div>

      {/* ================= ALERTS ================= */}

      <div className="grid md:grid-cols-2 gap-6">

        <ProfitAlerts jobs={jobs || {}} />

        <TopJobs jobs={jobs || {}} />

      </div>

      {/* ================= REVENUE ================= */}

      <div className="bg-slate-900 p-4 rounded-xl shadow">

        <h2 className="text-xl font-semibold mb-2">
          💰 Revenue
        </h2>

        <p>
          Total Revenue:
          ${analytics?.totalRevenue || 0}
        </p>

        <p>
          Profit:
          ${analytics?.totalProfit || 0}
        </p>

      </div>

      {/* ================= CHARTS ================= */}

      <div className="grid md:grid-cols-2 gap-6">

        <RevenueChart
          data={analytics?.monthly || []}
        />

        <ProductChart
          data={analytics?.products || []}
        />

      </div>

      {/* ================= ATTENTION ================= */}

      <div className="bg-slate-900 p-4 rounded-xl shadow">

        <h2 className="text-xl mb-2">
          🚨 Attention Needed
        </h2>

        {alerts.length === 0 && (
          <p>All good 🎉</p>
        )}

        {alerts.map(o => (

          <div key={o._id}>
            #{o._id.slice(-6)} — {o.status}
          </div>

        ))}

      </div>

      {/* ================= ACTIONS ================= */}

      <div className="flex flex-wrap gap-4">

        <button
          onClick={() =>
            navigate("/admin/orders")
          }
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          📦 Orders
        </button>

        <button
          onClick={() =>
            navigate("/admin/production")
          }
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          🏭 Production
        </button>

        <button
          onClick={() =>
            navigate("/admin/revenue")
          }
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
        >
          💰 Revenue
        </button>

      </div>

    </div>
  )
}

/* ================= KPI CARD ================= */

function Card({
  title,
  value,
  color
}) {

  return (

    <div className="bg-slate-900 p-4 rounded-xl shadow">

      <h3 className="text-gray-400 text-sm">
        {title}
      </h3>

      <p className={`text-2xl font-bold ${color}`}>
        {value}
      </p>

    </div>
  )
}

export default Dashboard