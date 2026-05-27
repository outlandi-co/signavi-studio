import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

const statusStyles = {
  pending: "border-slate-500/30 bg-slate-500/10 text-slate-300",
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
  "payment_required",
  "paid",
  "ready_for_production",
  "production",
  "shipping",
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
  let storedUser = null

  try {
    storedUser = JSON.parse(
      localStorage.getItem("customerUser") || "null"
    )
  } catch {
    console.warn("⚠️ Failed to parse customerUser")
  }

  const email =
    storedUser?.email ||
    storedUser?.user?.email ||
    storedUser?.data?.email ||
    localStorage.getItem("customerEmail") ||
    ""

  return String(email).trim().toLowerCase()
}

const normalizeOrders = (payload) => {
  const data =
    payload?.data ||
    payload?.orders ||
    payload?.myOrders ||
    payload ||
    []

  const list = Array.isArray(data) ? data : []

  return [...list].sort(
    (a, b) =>
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
  )
}

export default function MyOrders() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setError("")

        const email = getCustomerEmail()

        if (!email) {
          setOrders([])
          setError("Please log in again to view your orders.")
          return
        }

        console.log("📧 USING EMAIL:", email)

        const res = await api.get(
          `/orders/my-orders?email=${encodeURIComponent(email)}`
        )

        console.log("📦 ORDERS:", res.data)

        if (!mounted) return

        setOrders(normalizeOrders(res.data))
      } catch (err) {
        if (!mounted) return

        console.error("❌ LOAD ORDERS ERROR:", err)

        if (err.response?.status === 404) {
          setError("Orders route not found. Check your backend deployment.")
        } else {
          setError("Failed to load orders.")
        }

        setOrders([])
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

  const stats = useMemo(() => {
    const activeOrders = orders.filter((order) => {
      return ![
        "delivered",
        "shipped",
        "archive",
        "denied"
      ].includes(order.status || "")
    })

    const awaitingPayment = orders.filter(
      (order) => order.status === "payment_required"
    )

    const totalSpent = orders.reduce((sum, order) => {
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

    return {
      totalOrders: orders.length,
      activeOrders: activeOrders.length,
      awaitingPayment: awaitingPayment.length,
      totalSpent
    }
  }, [orders])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        ⏳ Loading orders...
      </main>
    )
  }

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
            Customer Orders
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            📦 My Orders
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            View your order history, payment status, production progress,
            tracking updates, invoices, and receipts.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-red-500/40 bg-red-950/40 p-6 text-red-300">
            {error}
          </div>
        )}

        {!error && (
          <>
            <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Total Orders"
                value={stats.totalOrders}
                note="All orders"
                accent="text-cyan-300"
              />

              <SummaryCard
                label="Active Orders"
                value={stats.activeOrders}
                note="Currently in progress"
                accent="text-blue-300"
              />

              <SummaryCard
                label="Awaiting Payment"
                value={stats.awaitingPayment}
                note="Payment required"
                accent="text-yellow-300"
              />

              <SummaryCard
                label="Total Spent"
                value={money(stats.totalSpent)}
                note="Across all orders"
                accent="text-emerald-300"
              />
            </div>

            {orders.length === 0 ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-10 text-center shadow-xl shadow-black/20">
                <h2 className="mb-3 text-2xl font-bold">
                  No Orders Found
                </h2>

                <p className="mb-6 text-slate-400">
                  When you place an order, it will show up here.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/store")}
                  className="rounded-full bg-cyan-500 px-6 py-3 font-bold text-black transition hover:bg-cyan-400"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="grid gap-5">
                {orders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    navigate={navigate}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}

function OrderCard({
  order,
  navigate
}) {
  const status = order.status || "pending"

  const subtotal = Number(order.subtotal || 0)
  const tax = Number(order.tax || 0)
  const shipping = Number(
    order.shipping ||
      order.shippingCost ||
      0
  )

  const total = Number(
    order.finalPrice ||
      order.total ||
      subtotal + tax + shipping
  )

  const trackingNumber =
    order.trackingNumber ||
    order.tracking ||
    ""

  const trackingLink =
    order.trackingLink ||
    order.trackingUrl ||
    order.shippingTrackingLink ||
    ""

  const paymentUrl =
    order.paymentUrl ||
    order.squarePaymentUrl ||
    order.checkoutUrl ||
    ""

  const invoiceId =
    order.invoiceId ||
    order.invoice?._id ||
    order.invoice ||
    ""

  const invoiceUrl =
    order.invoiceUrl ||
    order.invoice?.url ||
    order.invoiceDownloadUrl ||
    ""

  const receiptUrl =
    order.receiptUrl ||
    order.receipt?.url ||
    order.receiptDownloadUrl ||
    ""

  return (
    <article
      onClick={() => navigate(`/order/${order._id}`)}
      className="cursor-pointer rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20 transition hover:border-cyan-500"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.18em] text-slate-500">
            Order
          </p>

          <h2 className="text-2xl font-bold">
            #{String(order._id || "").slice(-6).toUpperCase()}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString()
              : "No date"}
          </p>
        </div>

        <span
          className={`rounded-full border px-4 py-2 text-xs font-bold ${
            statusStyles[status] ||
            "border-slate-500/30 bg-slate-500/10 text-slate-300"
          }`}
        >
          {formatStatus(status)}
        </span>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <DetailBox
          label="Items"
          value={`${order.items?.length || 0} item(s)`}
        />

        <DetailBox
          label="Total"
          value={money(total)}
        />

        <DetailBox
          label="Tracking"
          value={trackingNumber || "Not added yet"}
        />
      </div>

      {order.items?.length > 0 ? (
        <div className="mb-5 rounded-2xl border border-slate-800 bg-[#020617] p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">
            Order Items
          </p>

          <div className="space-y-2">
            {order.items.map((item, index) => {
              const price = Number(item.price || 0)
              const qty = Number(item.quantity || 1)

              return (
                <div
                  key={`${item.name || "item"}-${index}`}
                  className="flex flex-wrap justify-between gap-3 text-sm text-slate-300"
                >
                  <span>
                    {item.name || "Item"}{" "}
                    <span className="text-slate-500">
                      (
                      {item.variant?.color ||
                        item.selectedVariant?.color ||
                        "-"}
                      {" / "}
                      {item.variant?.size ||
                        item.selectedVariant?.size ||
                        "-"}
                      )
                    </span>
                  </span>

                  <span>
                    × {qty} — {money(price * qty)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="mb-5 rounded-2xl border border-slate-800 bg-[#020617] p-4 text-sm text-slate-500">
          No items listed.
        </div>
      )}

      <Timeline status={status} />

      <div className="mt-6 rounded-2xl border border-slate-800 bg-[#020617] p-4">
        <div className="grid gap-2 text-sm text-slate-300 md:grid-cols-4">
          <p>Subtotal: {money(subtotal)}</p>
          <p>Tax: {money(tax)}</p>
          <p>Shipping: {money(shipping)}</p>
          <p className="font-bold text-emerald-300">
            Total: {money(total)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            navigate(`/order/${order._id}`)
          }}
          className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-300"
        >
          Details
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            navigate(`/track/${order._id}`)
          }}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-500"
        >
          Track
        </button>

        {trackingLink && (
          <a
            href={trackingLink}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-300"
          >
            Tracking Link
          </a>
        )}

        {paymentUrl && status === "payment_required" && (
          <a
            href={paymentUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-yellow-300"
          >
            Pay Now
          </a>
        )}

        {invoiceId && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              navigate(`/invoice/${invoiceId}`)
            }}
            className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-300"
          >
            Invoice
          </button>
        )}

        {invoiceUrl && (
          <a
            href={invoiceUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-300"
          >
            Download Invoice
          </a>
        )}

        {receiptUrl && (
          <a
            href={receiptUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-300"
          >
            Receipt
          </a>
        )}
      </div>

      {trackingNumber && (
        <p className="mt-4 text-sm text-emerald-400">
          Tracking #: {trackingNumber}
        </p>
      )}
    </article>
  )
}

function Timeline({
  status
}) {
  const normalizedStatus =
    status === "shipped"
      ? "shipping"
      : status

  const activeIndex =
    timelineSteps.indexOf(normalizedStatus)

  return (
    <div className="mt-5">
      <div className="mb-2 flex justify-between text-[10px] uppercase tracking-[0.14em] text-slate-500">
        {timelineSteps.map((step) => (
          <span key={step}>
            {step === "payment_required"
              ? "Payment"
              : step === "ready_for_production"
                ? "Ready"
                : formatStatus(step)}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-6 gap-2">
        {timelineSteps.map((step, index) => (
          <div
            key={step}
            className={
              activeIndex >= 0 &&
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

function SummaryCard({
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

function DetailBox({
  label,
  value
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#020617] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-white">
        {value}
      </p>
    </div>
  )
}