import { useEffect, useMemo, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts"

import api from "../services/api"
import ExpenseManager from "../components/ExpenseManager"

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const normalizeAnalytics = (payload) => {
  return payload?.data || payload || {}
}

export default function AnalyticsPanel() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setError("")

        const res = await api.get("/orders/analytics")

        if (!mounted) return

        setData(normalizeAnalytics(res.data))
      } catch (err) {
        if (!mounted) return

        console.error("❌ ANALYTICS ERROR:", err.response?.data || err)
        setError("Failed to load analytics.")
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }, 0)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  const analytics = useMemo(() => {
    const monthly =
      data?.monthly ||
      data?.revenueByMonth ||
      data?.revenueByDay ||
      []

    const products =
      data?.products ||
      data?.topProducts ||
      []

    const totalRevenue =
      data?.totalRevenue ||
      monthly.reduce((sum, item) => sum + Number(item.revenue || item.total || 0), 0)

    const totalProfit =
      data?.totalProfit ||
      monthly.reduce((sum, item) => sum + Number(item.profit || 0), 0)

    const totalFees =
      data?.totalFees ||
      data?.fees ||
      0

    const totalCOGS =
      data?.totalCOGS ||
      data?.totalCogs ||
      data?.cogs ||
      0

    const totalOrders =
      data?.totalOrders ||
      data?.orderCount ||
      monthly.reduce((sum, item) => sum + Number(item.count || 0), 0)

    const averageOrder =
      totalOrders > 0
        ? totalRevenue / totalOrders
        : 0

    return {
      monthly,
      products,
      totalRevenue,
      totalProfit,
      totalFees,
      totalCOGS,
      totalOrders,
      averageOrder,
      insights: data?.insights || []
    }
  }, [data])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        Loading analytics...
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl rounded-3xl border border-red-500/40 bg-red-950/40 p-6 text-red-300">
          {error}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            📊 Analytics Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Track revenue, profit, expenses, product performance, and business insights.
          </p>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <Card title="Revenue" value={money(analytics.totalRevenue)} accent="text-cyan-300" />
          <Card title="Profit" value={money(analytics.totalProfit)} accent="text-emerald-300" />
          <Card title="Fees" value={money(analytics.totalFees)} accent="text-yellow-300" />
          <Card title="COGS" value={money(analytics.totalCOGS)} accent="text-red-300" />
          <Card title="Avg Order" value={money(analytics.averageOrder)} accent="text-blue-300" />
        </div>

        <div className="mb-8 grid gap-6 xl:grid-cols-2">
          <ChartCard
            title="📈 Monthly Performance"
            subtitle="Revenue and profit trends"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.15)" />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: "12px",
                    color: "#fff"
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={3} />
                <Line type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="📊 Product Performance"
            subtitle="Top products by revenue and profit"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.products}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.15)" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: "12px",
                    color: "#fff"
                  }}
                />
                <Bar dataKey="revenue" fill="#06b6d4" radius={[10, 10, 0, 0]} />
                <Bar dataKey="profit" fill="#22c55e" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
          <h2 className="mb-5 text-2xl font-bold">
            🤖 Insights
          </h2>

          {analytics.insights.length === 0 ? (
            <p className="text-slate-500">
              No insights available yet.
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.insights.map((item, index) => (
                <p
                  key={`${item}-${index}`}
                  className="rounded-2xl border border-slate-800 bg-[#020617] p-4 text-slate-300"
                >
                  • {item}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
          <h2 className="mb-5 text-2xl font-bold">
            Expenses
          </h2>

          <ExpenseManager />
        </div>
      </section>
    </main>
  )
}

function Card({
  title,
  value,
  accent
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
      <p className="mb-2 text-sm text-slate-400">
        {title}
      </p>

      <h2 className={`text-3xl font-extrabold ${accent}`}>
        {value}
      </h2>
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  children
}) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
      <div className="mb-5">
        <h2 className="text-xl font-bold">
          {title}
        </h2>

        <p className="text-sm text-slate-500">
          {subtitle}
        </p>
      </div>

      {children}
    </section>
  )
}