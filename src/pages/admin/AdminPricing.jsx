import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react"

import api from "../../services/api"

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const percent = (value = 0) => {
  return `${Number(value || 0).toFixed(1)}%`
}

const getSafeSummary = (data = {}) => {
  return {
    revenue: Number(data.revenue || data.totalRevenue || 0),
    profit: Number(data.profit || data.totalProfit || 0),
    count: Number(data.count || data.orders || data.totalOrders || 0),
    avgMargin: Number(data.avgMargin || data.margin || 0),
    cogs: Number(data.cogs || data.totalCogs || 0)
  }
}

export default function AdminProfit() {
  const [summary, setSummary] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  const load = useCallback(async () => {
    try {
      setLoading(true)

      const [summaryRes, ordersRes] = await Promise.all([
        api.get("/orders/profit-summary"),
        api.get("/orders").catch(() => ({
          data: {
            data: []
          }
        }))
      ])

      const summaryData =
        summaryRes.data?.data ||
        summaryRes.data ||
        {}

      const ordersData = Array.isArray(ordersRes.data)
        ? ordersRes.data
        : Array.isArray(ordersRes.data?.data)
          ? ordersRes.data.data
          : []

      setSummary(getSafeSummary(summaryData))
      setOrders(ordersData)
    } catch (err) {
      console.error("❌ LOAD PROFIT:", err)
      setSummary(getSafeSummary({}))
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      load()
    }, 0)

    return () => clearTimeout(timer)
  }, [load])

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders

    if (filter === "low-margin") {
      return orders.filter(
        (order) => Number(order.margin || 0) < 30
      )
    }

    if (filter === "profitable") {
      return orders.filter(
        (order) => Number(order.profit || 0) > 0
      )
    }

    if (filter === "loss") {
      return orders.filter(
        (order) => Number(order.profit || 0) < 0
      )
    }

    return orders
  }, [orders, filter])

  const calculatedRevenue = orders.reduce(
    (sum, order) =>
      sum +
      Number(
        order.finalPrice ||
          order.total ||
          order.subtotal ||
          0
      ),
    0
  )

  const calculatedProfit = orders.reduce(
    (sum, order) =>
      sum + Number(order.profit || 0),
    0
  )

  const calculatedCogs = orders.reduce(
    (sum, order) =>
      sum + Number(order.cogs || order.cost || 0),
    0
  )

  const safeSummary = summary || getSafeSummary({})

  const revenue =
    safeSummary.revenue || calculatedRevenue

  const profit =
    safeSummary.profit || calculatedProfit

  const cogs =
    safeSummary.cogs || calculatedCogs

  const orderCount =
    safeSummary.count || orders.length

  const avgMargin =
    safeSummary.avgMargin ||
    (revenue > 0 ? (profit / revenue) * 100 : 0)

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] p-6 text-white">
        Loading profit dashboard...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              SignaVi Studio
            </p>

            <h1 className="text-4xl font-extrabold md:text-5xl">
              Profit Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Track revenue, profit, cost of goods, margins, and low-margin
              orders from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={load}
            className="rounded-full bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
          >
            Refresh
          </button>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Revenue"
            value={money(revenue)}
            accent="text-cyan-300"
          />

          <MetricCard
            label="Profit"
            value={money(profit)}
            accent={profit >= 0 ? "text-emerald-300" : "text-red-300"}
          />

          <MetricCard
            label="COGS"
            value={money(cogs)}
            accent="text-orange-300"
          />

          <MetricCard
            label="Orders"
            value={orderCount}
            accent="text-blue-300"
          />

          <MetricCard
            label="Avg Margin"
            value={percent(avgMargin)}
            accent={avgMargin >= 30 ? "text-emerald-300" : "text-yellow-300"}
          />
        </div>

        <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/20">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div>
              <h2 className="text-2xl font-bold">
                Order Profit Review
              </h2>

              <p className="mt-2 text-slate-400">
                Review profitable, low-margin, and negative-profit orders.
              </p>
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
            >
              <option value="all">
                All Orders
              </option>

              <option value="profitable">
                Profitable
              </option>

              <option value="low-margin">
                Low Margin
              </option>

              <option value="loss">
                Negative Profit
              </option>
            </select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-10 text-center">
            <h2 className="mb-3 text-2xl font-bold">
              No Orders Found
            </h2>

            <p className="text-slate-400">
              No orders match the selected profit filter.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-xl shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-[#020617] text-sm text-slate-400">
                  <tr>
                    <th className="p-4">Order</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Revenue</th>
                    <th className="p-4">COGS</th>
                    <th className="p-4">Profit</th>
                    <th className="p-4">Margin</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => {
                    const orderRevenue = Number(
                      order.finalPrice ||
                        order.total ||
                        order.subtotal ||
                        0
                    )

                    const orderCogs = Number(
                      order.cogs ||
                        order.cost ||
                        0
                    )

                    const orderProfit = Number(
                      order.profit ||
                        orderRevenue - orderCogs
                    )

                    const orderMargin =
                      Number(order.margin) ||
                      (orderRevenue > 0
                        ? (orderProfit / orderRevenue) * 100
                        : 0)

                    return (
                      <tr
                        key={order._id}
                        className="border-t border-slate-800 text-sm transition hover:bg-cyan-400/5"
                      >
                        <td className="p-4 font-mono font-bold text-cyan-300">
                          #{String(order._id || "").slice(-6).toUpperCase()}
                        </td>

                        <td className="p-4">
                          <p className="font-bold text-white">
                            {order.customerName || "Unknown"}
                          </p>

                          <p className="text-xs text-slate-500">
                            {order.email || "No email"}
                          </p>
                        </td>

                        <td className="p-4 font-bold text-cyan-300">
                          {money(orderRevenue)}
                        </td>

                        <td className="p-4 text-orange-300">
                          {money(orderCogs)}
                        </td>

                        <td
                          className={
                            orderProfit >= 0
                              ? "p-4 font-bold text-emerald-300"
                              : "p-4 font-bold text-red-300"
                          }
                        >
                          {money(orderProfit)}
                        </td>

                        <td
                          className={
                            orderMargin >= 30
                              ? "p-4 font-bold text-emerald-300"
                              : "p-4 font-bold text-yellow-300"
                          }
                        >
                          {percent(orderMargin)}
                        </td>

                        <td className="p-4 text-slate-300">
                          {String(order.status || "unknown")
                            .replaceAll("_", " ")}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

function MetricCard({
  label,
  value,
  accent
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
      <p className="mb-2 text-sm text-slate-400">
        {label}
      </p>

      <h2 className={`text-3xl font-extrabold ${accent}`}>
        {value}
      </h2>
    </div>
  )
}