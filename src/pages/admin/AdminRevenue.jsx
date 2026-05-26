import { useEffect, useState } from "react"
import api from "../../services/api"

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const formatStatus = (status = "") => {
  return String(status || "unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function AdminRevenue() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadOrders = async () => {
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
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    const timer = setTimeout(() => {
      loadOrders()
    }, 0)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [])

  const totalRevenue = orders.reduce(
    (sum, order) =>
      sum + Number(order.finalPrice || order.total || 0),
    0
  )

  const totalTax = orders.reduce(
    (sum, order) => sum + Number(order.tax || 0),
    0
  )

  const paidOrders = orders.filter(
    (order) =>
      order.status === "paid" ||
      order.status === "production" ||
      order.status === "shipping" ||
      order.status === "shipped" ||
      order.status === "delivered"
  )

  const awaitingPayment = orders.filter(
    (order) => order.status === "payment_required"
  )

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
                Track revenue, taxes, order totals, payment status, and export
                reports for accounting.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
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

        <div className="mb-8 grid gap-5 md:grid-cols-2">
          <SummaryCard label="Tax Collected" value={money(totalTax)} />
          <SummaryCard
            label="Average Order"
            value={money(orders.length ? totalRevenue / orders.length : 0)}
          />
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-xl shadow-black/20">
          <div className="border-b border-slate-800 p-6">
            <h2 className="text-2xl font-bold">
              Recent Revenue Orders
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="bg-[#020617] text-sm text-slate-400">
                <tr>
                  <th className="p-4">Order</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Tax</th>
                  <th className="p-4">Total</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-t border-slate-800 text-sm"
                  >
                    <td className="p-4 font-mono text-cyan-300">
                      #{String(order._id || "").slice(-6).toUpperCase()}
                    </td>

                    <td className="p-4">
                      {order.customerName || "Unknown"}
                    </td>

                    <td className="p-4">
                      {formatStatus(order.status)}
                    </td>

                    <td className="p-4">
                      {money(order.tax)}
                    </td>

                    <td className="p-4 font-bold text-emerald-300">
                      {money(order.finalPrice || order.total)}
                    </td>
                  </tr>
                ))}
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