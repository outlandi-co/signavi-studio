import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react"

import api from "../services/api"
import { getSocket } from "../services/socket"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid
} from "recharts"

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const percent = (value = 0) => {
  return `${Number(value || 0).toFixed(2)}%`
}

const cardClass =
  "rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20 backdrop-blur"

const chartClass =
  "rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20 backdrop-blur"

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const loadingRef = useRef(false)

  const load = useCallback(async () => {
    if (loadingRef.current) return

    try {
      loadingRef.current = true

      const res = await api.get("/orders/analytics")

      setData(res.data?.data || {})
      setLastUpdated(new Date())
    } catch (err) {
      console.error("❌ DASHBOARD ANALYTICS ERROR:", err)
    } finally {
      loadingRef.current = false
    }
  }, [])

 useEffect(() => {
  const timer = setTimeout(() => {
    load()
  }, 0)

  return () => clearTimeout(timer)
}, [load])

  useEffect(() => {
    let socket
    let mounted = true

    const init = async () => {
      socket = await getSocket()
      if (!socket || !mounted) return

      const update = () => load()

      socket.on("jobUpdated", update)
      socket.on("jobCreated", update)
      socket.on("orderUpdated", update)
      socket.on("orderCreated", update)
      socket.on("pricingUpdated", update)
    }

    init()

    return () => {
      mounted = false

      socket?.off("jobUpdated")
      socket?.off("jobCreated")
      socket?.off("orderUpdated")
      socket?.off("orderCreated")
      socket?.off("pricingUpdated")
    }
  }, [load])

  if (!data) {
    return (
      <main className="min-h-screen bg-[#020617] p-6 text-white">
        <p className="text-slate-400">
          Loading dashboard...
        </p>
      </main>
    )
  }

  const revenue = data.revenueByDay || []
  const products = data.topProducts || []
  const lowMargin = data.lowMarginOrders || []

  const totalRevenue = revenue.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0
  )

  const totalOrders =
    data.totalOrders ||
    data.orderCount ||
    revenue.reduce(
      (sum, item) => sum + Number(item.count || 0),
      0
    )

  const totalProfit =
    data.totalProfit ||
    lowMargin.reduce(
      (sum, item) => sum + Number(item.profit || 0),
      0
    )

  const averageOrderValue =
    totalOrders > 0 ? totalRevenue / totalOrders : 0

  const bestProduct = products[0]?.name || "No product data"

  return (
    <main className="min-h-screen bg-[#020617] p-6 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-extrabold md:text-5xl">
                Admin Dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-slate-400">
                Track revenue, top products, low-margin orders, and production
                performance from one business command center.
              </p>
            </div>

            <button
              type="button"
              onClick={load}
              className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-5 py-3 font-bold text-cyan-300 transition hover:bg-cyan-400 hover:text-black"
            >
              Refresh
            </button>
          </div>

          {lastUpdated && (
            <p className="mt-3 text-sm text-slate-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            label="Total Revenue"
            value={money(totalRevenue)}
            note="Revenue trend total"
            accent="text-cyan-300"
          />

          <DashboardCard
            label="Average Order"
            value={money(averageOrderValue)}
            note={`${totalOrders || 0} tracked orders`}
            accent="text-blue-300"
          />

          <DashboardCard
            label="Top Product"
            value={bestProduct}
            note="Best seller by revenue"
            accent="text-emerald-300"
            small
          />

          <DashboardCard
            label="Low Margin Alerts"
            value={lowMargin.length}
            note={
              lowMargin.length > 0
                ? "Needs review"
                : "All margins healthy"
            }
            accent={
              lowMargin.length > 0
                ? "text-red-400"
                : "text-emerald-300"
            }
          />
        </div>

        <div className="mb-8 grid gap-6 xl:grid-cols-2">
          <div className={chartClass}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Revenue Trend
                </h2>

                <p className="text-sm text-slate-500">
                  Daily sales performance
                </p>
              </div>

              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">
                {money(totalRevenue)}
              </span>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={revenue}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,.12)"
                />

                <XAxis
                  dataKey="date"
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

                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={chartClass}>
            <div className="mb-5">
              <h2 className="text-xl font-bold">
                Top Products
              </h2>

              <p className="text-sm text-slate-500">
                Best performing products by revenue
              </p>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={products}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,.12)"
                />

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

                <Bar
                  dataKey="revenue"
                  fill="#22c55e"
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
          <div className={cardClass}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Low Margin Orders
                </h2>

                <p className="text-sm text-slate-500">
                  Orders that may need pricing review
                </p>
              </div>

              <span
                className={
                  lowMargin.length > 0
                    ? "rounded-full bg-red-500/10 px-3 py-1 text-sm font-bold text-red-400"
                    : "rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-bold text-emerald-400"
                }
              >
                {lowMargin.length}
              </span>
            </div>

            {lowMargin.length === 0 ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-emerald-300">
                All margins healthy.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-800">
                {lowMargin.map((order, index) => (
                  <div
                    key={order._id || index}
                    className="grid grid-cols-3 gap-3 border-b border-slate-800 px-4 py-3 text-sm last:border-b-0"
                  >
                    <span className="truncate text-slate-300">
                      {order.customer ||
                        order.customerName ||
                        "Customer"}
                    </span>

                    <span className="text-red-400">
                      {percent(order.margin)}
                    </span>

                    <span className="text-right text-slate-300">
                      {money(order.total || order.finalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={cardClass}>
            <h2 className="mb-5 text-xl font-bold">
              Business Snapshot
            </h2>

            <div className="space-y-4">
              <SnapshotRow
                label="Revenue"
                value={money(totalRevenue)}
              />

              <SnapshotRow
                label="Orders"
                value={totalOrders || 0}
              />

              <SnapshotRow
                label="Average Order Value"
                value={money(averageOrderValue)}
              />

              <SnapshotRow
                label="Estimated Profit"
                value={money(totalProfit)}
              />

              <SnapshotRow
                label="Best Product"
                value={bestProduct}
              />
            </div>

            <p className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-relaxed text-cyan-200">
              Tip: Review low-margin orders before production so you protect
              material costs, labor time, and profit.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

function DashboardCard({
  label,
  value,
  note,
  accent,
  small = false
}) {
  return (
    <div className={cardClass}>
      <p className="mb-2 text-sm text-slate-400">
        {label}
      </p>

      <h2
        className={
          small
            ? `truncate text-2xl font-extrabold ${accent}`
            : `text-3xl font-extrabold ${accent}`
        }
      >
        {value}
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        {note}
      </p>
    </div>
  )
}

function SnapshotRow({
  label,
  value
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-b-0">
      <span className="text-slate-400">
        {label}
      </span>

      <strong className="max-w-[180px] truncate text-right text-white">
        {value}
      </strong>
    </div>
  )
}