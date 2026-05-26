import { useEffect, useMemo, useState } from "react"
import api from "../../services/api"

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })
}

const percent = (value = 0) => {
  return `${Number(value || 0).toFixed(1)}%`
}

const formatStatus = (status = "") => {
  return String(status || "unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const paidStatuses = [
  "paid",
  "ready_for_production",
  "production",
  "shipping",
  "shipped",
  "delivered",
]

export default function AdminRevenue() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")

  const loadOrders = async () => {
    try {
      setLoading(true)

      const res = await api.get("/orders")

      const safeOrders = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : []

      setOrders(safeOrders)
    } catch (err) {
      console.error("❌ ADMIN REVENUE ERROR:", err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/orders")

        const safeOrders = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : []

        if (isMounted) {
          setOrders(safeOrders)
        }
      } catch (err) {
        console.error("❌ ADMIN REVENUE ERROR:", err)

        if (isMounted) {
          setOrders([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }, 0)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [])

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders

    return orders.filter((order) => order.status === statusFilter)
  }, [orders, statusFilter])

  const totalRevenue = orders.reduce((sum, order) => {
    return sum + Number(order.finalPrice || order.total || order.subtotal || 0)
  }, 0)

  const totalTax = orders.reduce((sum, order) => {
    return sum + Number(order.tax || 0)
  }, 0)

  const totalProfit = orders.reduce((sum, order) => {
    return sum + Number(order.profit || 0)
  }, 0)

  const totalCogs = orders.reduce((sum, order) => {
    return sum + Number(order.cogs || order.cost || 0)
  }, 0)

  const paidOrders = orders.filter((order) =>
    paidStatuses.includes(order.status)
  )

  const awaitingPayment = orders.filter(
    (order) => order.status === "payment_required"
  )

  const paidRevenue = paidOrders.reduce((sum, order) => {
    return sum + Number(order.finalPrice || order.total || order.subtotal || 0)
  }, 0)

  const awaitingPaymentValue = awaitingPayment.reduce((sum, order) => {
    return sum + Number(order.finalPrice || order.total || order.subtotal || 0)
  }, 0)

  const averageOrder = orders.length ? totalRevenue / orders.length : 0

  const avgMargin =
    totalRevenue > 0
      ? (totalProfit / totalRevenue) * 100
      : 0

  const uniqueStatuses = [
    "all",
    ...new Set(
      orders
        .map((order) => order.status)
        .filter(Boolean)
    ),
  ]

  const downloadOrdersCSV = () => {
    window.open(`${API_BASE}/orders/export`, "_blank")
  }

  const downloadTaxCSV = () => {
    window.open(`${API_BASE}/export-taxes`, "_blank")
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] p-6 text-white">
        Loading Revenue Dashboard...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-extrabold md:text-5xl">
                Revenue Dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-slate-400">
                Track revenue, taxes, profit, payment status, and export reports
                for accounting.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadOrders}
                className="rounded-full bg-slate-700 px-5 py-3 font-bold text-white transition hover:bg-slate-600"
              >
                Refresh
              </button>

              <button
                type="button"
                onClick={downloadOrdersCSV}
                className="rounded-full bg-emerald-500 px-5 py-3 font-bold text-black transition hover:bg-emerald-400"
              >
                Orders CSV
              </button>

              <button
                type="button"
                onClick={downloadTaxCSV}
                className="rounded-full bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
              >
                Tax CSV
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Total Orders" value={orders.length} />
          <SummaryCard label="Paid / Active" value={paidOrders.length} />
          <SummaryCard label="Awaiting Payment" value={awaitingPayment.length} />
          <SummaryCard label="Total Revenue" value={money(totalRevenue)} />
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Paid Revenue" value={money(paidRevenue)} />
          <SummaryCard
            label="Awaiting Value"
            value={money(awaitingPaymentValue)}
          />
          <SummaryCard label="Tax Collected" value={money(totalTax)} />
          <SummaryCard label="Average Order" value={money(averageOrder)} />
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <SummaryCard label="Profit" value={money(totalProfit)} />
          <SummaryCard label="COGS" value={money(totalCogs)} />
          <SummaryCard label="Avg Margin" value={percent(avgMargin)} />
        </div>

        <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/20">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div>
              <h2 className="text-2xl font-bold">
                Recent Revenue Orders
              </h2>

              <p className="mt-2 text-slate-400">
                Filter orders by status and review tax, totals, and profit.
              </p>
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none focus:border-cyan-400"
            >
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status === "all"
                    ? "All Statuses"
                    : formatStatus(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-xl shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="bg-[#020617] text-sm text-slate-400">
                <tr>
                  <th className="p-4">Order</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Tax</th>
                  <th className="p-4">COGS</th>
                  <th className="p-4">Profit</th>
                  <th className="p-4">Total</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-6 text-center text-slate-400"
                    >
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const total = Number(
                      order.finalPrice ||
                        order.total ||
                        order.subtotal ||
                        0
                    )

                    const cogs = Number(order.cogs || order.cost || 0)
                    const profit = Number(order.profit || total - cogs)

                    return (
                      <tr
                        key={order._id}
                        className="border-t border-slate-800 text-sm transition hover:bg-cyan-400/5"
                      >
                        <td className="p-4 font-mono text-cyan-300">
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

                        <td className="p-4">
                          {formatStatus(order.status)}
                        </td>

                        <td className="p-4">
                          {money(order.tax)}
                        </td>

                        <td className="p-4 text-orange-300">
                          {money(cogs)}
                        </td>

                        <td
                          className={
                            profit >= 0
                              ? "p-4 font-bold text-emerald-300"
                              : "p-4 font-bold text-red-300"
                          }
                        >
                          {money(profit)}
                        </td>

                        <td className="p-4 font-bold text-emerald-300">
                          {money(total)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
      <p className="mb-2 text-sm text-slate-400">
        {label}
      </p>

      <h2 className="text-3xl font-extrabold text-cyan-300">
        {value}
      </h2>
    </div>
  )
}