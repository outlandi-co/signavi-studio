import { useEffect, useState, useCallback, useRef } from "react"
import api from "../services/api"
import { getSocket } from "../services/socket"

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid
} from "recharts"

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const loadingRef = useRef(false)

  const load = useCallback(async () => {
    if (loadingRef.current) return
    try {
      loadingRef.current = true
      const res = await api.get("/orders/analytics")
      setData(res.data?.data)
    } catch (err) {
      console.error(err)
    } finally {
      loadingRef.current = false
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    let socket
    const init = async () => {
      socket = await getSocket()
      if (!socket) return
      const update = () => load()
      socket.on("jobUpdated", update)
      socket.on("pricingUpdated", update)
    }
    init()
    return () => {
      socket?.off("jobUpdated")
      socket?.off("pricingUpdated")
    }
  }, [load])

  if (!data) return <div className="text-white p-6">Loading...</div>

  const revenue = data.revenueByDay || []
  const products = data.topProducts || []
  const lowMargin = data.lowMarginOrders || []

  const totalRevenue = revenue.reduce((s, r) => s + r.total, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-white p-6">

      <h1 className="text-3xl font-bold mb-6">📊 Admin Dashboard</h1>

      {/* KPI CARDS */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">

        <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl shadow-lg">
          <p className="text-sm text-gray-300">Total Revenue</p>
          <h2 className="text-2xl font-bold text-cyan-400">
            ${totalRevenue.toFixed(2)}
          </h2>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl shadow-lg">
          <p className="text-sm text-gray-300">Top Product</p>
          <h2 className="text-xl font-bold text-green-400">
            {products[0]?.name || "—"}
          </h2>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl shadow-lg">
          <p className="text-sm text-gray-300">Low Margin Alerts</p>
          <h2 className={`text-2xl font-bold ${lowMargin.length ? "text-red-500" : "text-green-400"}`}>
            {lowMargin.length}
          </h2>
        </div>

      </div>

      {/* REVENUE CHART */}
      <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl shadow-lg mb-6">
        <h2 className="mb-4 text-lg font-semibold">📈 Revenue Trend</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenue}>
            <XAxis dataKey="date" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#06b6d4" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* PRODUCT CHART */}
      <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl shadow-lg mb-6">
        <h2 className="mb-4 text-lg font-semibold">🏆 Top Products</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={products}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Bar dataKey="revenue" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* LOW MARGIN */}
      <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">🚨 Low Margin Orders</h2>

        {lowMargin.length === 0 ? (
          <p className="text-green-400">All margins healthy</p>
        ) : (
          lowMargin.map((o, i) => (
            <div key={i} className="flex justify-between text-red-400 border-b border-white/10 py-2">
              <span>{o.customer}</span>
              <span>{o.margin.toFixed(2)}%</span>
              <span>${o.total.toFixed(2)}</span>
            </div>
          ))
        )}
      </div>

    </div>
  )
}