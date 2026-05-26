import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

const statusStyles = {
  pending: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  quotes: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  payment_required: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  ready_for_production: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  production: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  shipping: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  shipped: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
  delivered: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  denied: "border-red-500/30 bg-red-500/10 text-red-300",
  archive: "border-slate-500/30 bg-slate-500/10 text-slate-300"
}

const timelineSteps = [
  "pending",
  "payment_required",
  "paid",
  "production",
  "shipping",
  "delivered"
]

const formatStatus = (status = "") => {
  return String(status || "pending")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const getCustomerEmail = () => {
  let email = ""

  const storedUser = localStorage.getItem("customerUser")
  const fallbackEmail = localStorage.getItem("customerEmail")

  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser)
      email = parsedUser?.email || ""
    } catch {
      console.warn("⚠️ Could not parse customerUser from localStorage")
    }
  }

  if (!email && fallbackEmail) {
    email = fallbackEmail
  }

  return email.trim().toLowerCase()
}

export default function CustomerDashboard() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [quotes, setQuotes] = useState([])
  const [supportTickets, setSupportTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")

  useEffect(() => {
    let isMounted = true

    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError("")

        const email = getCustomerEmail()

        if (!isMounted) return

        setCustomerEmail(email)

        if (!email) {
          setOrders([])
          setQuotes([])
          setSupportTickets([])
          setError("Please log in again to view your dashboard.")
          return
        }

        const [ordersRes, quotesRes, supportRes] = await Promise.all([
          api.get(`/orders/my-orders?email=${encodeURIComponent(email)}`),
          api
            .get(`/quotes?email=${encodeURIComponent(email)}`)
            .catch(() => ({ data: { data: [] } })),
          api
            .get(`/support?email=${encodeURIComponent(email)}`)
            .catch(() => ({ data: { data: [] } }))
        ])

        if (!isMounted) return

        const orderData =
          ordersRes.data?.data ||
          ordersRes.data?.orders ||
          ordersRes.data?.myOrders ||
          ordersRes.data ||
          []

        const quoteData =
          quotesRes.data?.data ||
          quotesRes.data?.quotes ||
          quotesRes.data ||
          []

        const ticketData =
          supportRes.data?.data ||
          supportRes.data?.tickets ||
          supportRes.data ||
          []

        setOrders(Array.isArray(orderData) ? orderData : [])
        setQuotes(Array.isArray(quoteData) ? quoteData : [])
        setSupportTickets(Array.isArray(ticketData) ? ticketData : [])
      } catch (err) {
        if (!isMounted) return

        console.error("❌ Customer dashboard load error:", err)

        setOrders([])
        setQuotes([])
        setSupportTickets([])
        setError("Could not load your dashboard right now.")
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    const timer = setTimeout(() => {
      loadDashboard()
    }, 0)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [])

  const recentOrders = orders.slice(0, 5)
  const recentQuotes = quotes.slice(0, 4)
  const recentTickets = supportTickets.slice(0, 4)

  const activeOrders = orders.filter(
    (order) =>
      !["delivered", "shipped", "archive", "denied"].includes(
        order.status || ""
      )
  )

  const totalSpent = orders.reduce((sum, order) => {
    return sum + Number(order.finalPrice || order.total || order.subtotal || 0)
  }, 0)

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            Customer Portal
          </p>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-extrabold md:text-5xl">
                My Dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-slate-400">
                View your orders, quotes, support tickets, payment status, and
                production updates from SignaVi Studio.
              </p>

              {customerEmail && (
                <p className="mt-2 text-sm text-cyan-300">
                  Signed in as {customerEmail}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/store")}
                className="rounded-full bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
              >
                Continue Shopping
              </button>

              <button
                type="button"
                onClick={() => navigate("/quote")}
                className="rounded-full border border-slate-700 px-5 py-3 font-bold text-white transition hover:border-cyan-400 hover:text-cyan-300"
              >
                Request Quote
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <p className="rounded-3xl border border-slate-800 bg-slate-950 p-6 text-slate-400">
            Loading your dashboard...
          </p>
        )}

        {!loading && error && (
          <div className="mb-6 rounded-3xl border border-red-500/40 bg-red-950/40 p-6 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <DashboardCard
                label="Total Orders"
                value={orders.length}
                note="All customer orders"
                accent="text-cyan-300"
              />

              <DashboardCard
                label="Active Orders"
                value={activeOrders.length}
                note="Currently in progress"
                accent="text-blue-300"
              />

              <DashboardCard
                label="Quotes"
                value={quotes.length}
                note="Submitted quote requests"
                accent="text-purple-300"
              />

              <DashboardCard
                label="Total Spent"
                value={money(totalSpent)}
                note="Completed and active orders"
                accent="text-emerald-300"
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
              <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Recent Orders
                    </h2>

                    <p className="text-sm text-slate-500">
                      Track your latest SignaVi Studio orders.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/my-orders")}
                    className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-300"
                  >
                    View All
                  </button>
                </div>

                {recentOrders.length === 0 ? (
                  <EmptyState
                    title="No Orders Yet"
                    message="When you place an order, it will appear here."
                  />
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <OrderCard
                        key={order._id}
                        order={order}
                        navigate={navigate}
                      />
                    ))}
                  </div>
                )}
              </section>

              <div className="space-y-6">
                <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
                  <div className="mb-5">
                    <h2 className="text-2xl font-bold">
                      My Quotes
                    </h2>

                    <p className="text-sm text-slate-500">
                      Your recent custom quote requests.
                    </p>
                  </div>

                  {recentQuotes.length === 0 ? (
                    <EmptyState
                      title="No Quotes Yet"
                      message="Submit a custom quote request to get started."
                    />
                  ) : (
                    <div className="space-y-3">
                      {recentQuotes.map((quote) => (
                        <MiniItem
                          key={quote._id}
                          title={
                            quote.serviceLabel ||
                            quote.printType ||
                            "Quote Request"
                          }
                          meta={formatStatus(
                            quote.approvalStatus || quote.status || "pending"
                          )}
                          value={money(
                            quote.finalPrice || quote.price || 0
                          )}
                          onClick={() => navigate(`/quote/${quote._id}`)}
                        />
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
                  <div className="mb-5">
                    <h2 className="text-2xl font-bold">
                      Support Tickets
                    </h2>

                    <p className="text-sm text-slate-500">
                      Questions, updates, and support requests.
                    </p>
                  </div>

                  {recentTickets.length === 0 ? (
                    <EmptyState
                      title="No Tickets"
                      message="Need help? Start a support request."
                    />
                  ) : (
                    <div className="space-y-3">
                      {recentTickets.map((ticket) => (
                        <MiniItem
                          key={ticket._id}
                          title={ticket.subject || "Support Ticket"}
                          meta={formatStatus(ticket.status || "open")}
                          value={ticket.priority || "Normal"}
                          onClick={() => navigate(`/support/${ticket._id}`)}
                        />
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => navigate("/support")}
                    className="mt-5 w-full rounded-xl bg-cyan-500 px-4 py-3 font-bold text-black transition hover:bg-cyan-400"
                  >
                    Open Support
                  </button>
                </section>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

function DashboardCard({
  label,
  value,
  note,
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

      <p className="mt-2 text-sm text-slate-500">
        {note}
      </p>
    </div>
  )
}

function OrderCard({
  order,
  navigate
}) {
  const status = order.status || "pending"

  const total = Number(
    order.finalPrice ||
      order.total ||
      order.subtotal ||
      0
  )

  const itemCount = order.items?.length || 0

  return (
    <article
      onClick={() => navigate(`/order/${order._id}`)}
      className="cursor-pointer rounded-2xl border border-slate-800 bg-[#020617] p-5 transition hover:border-cyan-500"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Order
          </p>

          <h3 className="text-lg font-bold">
            #{String(order._id || "").slice(-6).toUpperCase()}
          </h3>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold ${
            statusStyles[status] ||
            "border-slate-500/30 bg-slate-500/10 text-slate-300"
          }`}
        >
          {formatStatus(status)}
        </span>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <DetailBox
          label="Date"
          value={
            order.createdAt
              ? new Date(order.createdAt).toLocaleDateString()
              : "No date"
          }
        />

        <DetailBox
          label="Items"
          value={`${itemCount} item(s)`}
        />

        <DetailBox
          label="Total"
          value={money(total)}
        />
      </div>

      <Timeline status={status} />

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            navigate(`/order/${order._id}`)
          }}
          className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-300"
        >
          Details
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            navigate(`/track/${order._id}`)
          }}
          className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-500"
        >
          Track
        </button>
      </div>
    </article>
  )
}

function Timeline({ status }) {
  const activeIndex = timelineSteps.indexOf(status)

  return (
    <div className="mt-4">
      <div className="mb-2 flex justify-between text-[10px] uppercase tracking-[0.14em] text-slate-500">
        {timelineSteps.map((step) => (
          <span key={step}>
            {step === "payment_required"
              ? "Payment"
              : formatStatus(step)}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-6 gap-2">
        {timelineSteps.map((step, index) => (
          <div
            key={step}
            className={
              index <= activeIndex
                ? "h-2 rounded-full bg-cyan-400"
                : "h-2 rounded-full bg-slate-800"
            }
          />
        ))}
      </div>
    </div>
  )
}

function DetailBox({
  label,
  value
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-white">
        {value}
      </p>
    </div>
  )
}

function MiniItem({
  title,
  meta,
  value,
  onClick
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-800 bg-[#020617] p-4 text-left transition hover:border-cyan-500"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-bold text-white">
            {title}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {meta}
          </p>
        </div>

        <span className="text-sm font-bold text-cyan-300">
          {value}
        </span>
      </div>
    </button>
  )
}

function EmptyState({
  title,
  message
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#020617] p-6 text-center">
      <h3 className="mb-2 font-bold text-white">
        {title}
      </h3>

      <p className="text-sm text-slate-500">
        {message}
      </p>
    </div>
  )
}