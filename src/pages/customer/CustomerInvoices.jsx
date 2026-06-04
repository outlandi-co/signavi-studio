import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

const paidStatuses = [
  "paid",
  "ready_for_production",
  "production",
  "shipping",
  "shipped",
  "delivered"
]

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const formatStatus = (status = "") => {
  return String(status || "pending")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const getCustomerEmail = () => {
  let email = ""

  const storedUser = localStorage.getItem("customerUser")
  const fallbackEmail = localStorage.getItem("customerEmail")

  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser)
      email = parsed?.email || ""
    } catch {
      console.warn("Could not parse customer user")
    }
  }

  if (!email && fallbackEmail) {
    email = fallbackEmail
  }

  return email.trim().toLowerCase()
}

const normalizeOrders = (payload) => {
  if (Array.isArray(payload)) return payload

  if (Array.isArray(payload?.orders)) {
    return payload.orders
  }

  if (Array.isArray(payload?.myOrders)) {
    return payload.myOrders
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  return []
}

export default function CustomerInvoices() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true

    const loadOrders = async () => {
      try {
        setLoading(true)
        setError("")

        const email = getCustomerEmail()

        if (!email) {
          setError("Please log in again.")
          return
        }

        const res = await api.get(
          `/orders/my-orders?email=${encodeURIComponent(email)}`
        )

        if (!mounted) return

        setOrders(normalizeOrders(res.data))
      } catch (err) {
        console.error(
          "❌ CUSTOMER INVOICES ERROR:",
          err.response?.data || err
        )

        if (!mounted) return

        setError("Unable to load invoices.")
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadOrders()

    return () => {
      mounted = false
    }
  }, [])

  const totalSpent = useMemo(() => {
    return orders.reduce((sum, order) => {
      return (
        sum +
        Number(
          order.finalPrice ||
            order.total ||
            order.subtotal ||
            0
        )
      )
    }, 0)
  }, [orders])

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-8 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
        >
          ← Back to Dashboard
        </button>

        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            Customer Billing
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            Invoices & Receipts
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            View invoices, payment history, receipts,
            downloadable order documents, and completed transactions.
          </p>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <StatCard
            label="Orders"
            value={orders.length}
            accent="text-cyan-300"
          />

          <StatCard
            label="Paid Orders"
            value={
              orders.filter((order) =>
                paidStatuses.includes(order.status)
              ).length
            }
            accent="text-emerald-300"
          />

          <StatCard
            label="Total Spent"
            value={money(totalSpent)}
            accent="text-yellow-300"
          />
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
          <div className="mb-6">
            <h2 className="text-2xl font-black">
              Order Documents
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Download invoices and receipts for your SignaVi Studio orders.
            </p>
          </div>

          {loading && (
            <div className="rounded-2xl border border-slate-800 bg-[#020617] p-8 text-center">
              <p className="text-slate-400">
                Loading invoices...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-[#020617] p-10 text-center">
              <div className="mb-4 text-5xl">
                🧾
              </div>

              <h3 className="text-2xl font-black">
                No Orders Yet
              </h3>

              <p className="mt-3 text-slate-500">
                Once orders are created, invoices and receipts will appear here.
              </p>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = order.status || "pending"

                const total = Number(
                  order.finalPrice ||
                    order.total ||
                    order.subtotal ||
                    0
                )

                return (
                  <article
                    key={order._id}
                    className="rounded-2xl border border-slate-800 bg-[#020617] p-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Order
                        </p>

                        <h3 className="mt-1 text-2xl font-black">
                          #
                          {String(order._id || "")
                            .slice(-6)
                            .toUpperCase()}
                        </h3>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                            {formatStatus(status)}
                          </span>

                          <span className="text-sm text-slate-500">
                            {order.createdAt
                              ? new Date(
                                  order.createdAt
                                ).toLocaleDateString()
                              : "No Date"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-3 lg:items-end">
                        <div>
                          <p className="text-sm text-slate-500">
                            Order Total
                          </p>

                          <h3 className="text-3xl font-black text-emerald-300">
                            {money(total)}
                          </h3>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/invoice/${order._id}`)
                            }
                            className="rounded-full bg-purple-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-purple-500"
                          >
                            Invoice
                          </button>

                          {paidStatuses.includes(status) && (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/receipt/${order._id}`)
                              }
                              className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-black transition hover:bg-emerald-400"
                            >
                              Receipt
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/order/${order._id}`)
                            }
                            className="rounded-full border border-slate-700 px-4 py-2 text-xs font-bold text-white transition hover:border-cyan-400 hover:text-cyan-300"
                          >
                            Order Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

function StatCard({
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