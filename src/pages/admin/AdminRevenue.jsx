import { useEffect, useState } from "react"
import api from "../../services/api"

export default function AdminRevenue() {

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/orders")
        setOrders(res.data)
      } catch (err) {
        console.error("❌ REVENUE LOAD ERROR:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) return <p className="text-white">Loading...</p>

  /* 💰 CALCULATIONS */
  const totalRevenue = orders.reduce((sum, o) => sum + (o.finalPrice || o.price || 0), 0)

  const lowProfit = orders.filter(o => (o.profit || 0) < 5)

  const topJobs = [...orders]
    .sort((a, b) => (b.profit || 0) - (a.profit || 0))
    .slice(0, 5)

  return (
    <div>

      <h1 className="text-2xl font-bold mb-6">💰 Revenue Dashboard</h1>

      {/* SUMMARY */}
      <div className="flex gap-6 mb-6">
        <div className="bg-gray-900 p-4 rounded-lg">
          <p>Total Revenue</p>
          <strong>${totalRevenue.toFixed(2)}</strong>
        </div>
      </div>

      {/* ⚠️ ALERTS */}
      <div className="bg-gray-900 p-4 rounded-lg mb-6 border border-gray-800">
        <h2 className="text-lg mb-2">🚨 Alerts</h2>
        <p className="text-red-400">
          {lowProfit.length} low-profit job(s)
        </p>
      </div>

      {/* 🏆 TOP PROFIT */}
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">

        <h2 className="text-lg mb-4">🏆 Top Profit Jobs</h2>

        {topJobs.map((job, i) => (
          <div
            key={job._id}
            className="flex justify-between border-b border-gray-800 py-2"
          >
            <p>{i + 1}. {job.customerName || "Unknown"}</p>
            <p className="text-green-400">
              ${job.profit || 0}
            </p>
          </div>
        ))}

      </div>

    </div>
  )
}