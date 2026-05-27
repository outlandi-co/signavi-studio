import { useState } from "react"
import toast from "react-hot-toast"
import api from "../services/api"
import Timeline from "../components/Timeline"

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const formatStatus = (status = "pending") => {
  return String(status || "pending")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const getOrderTotal = (order = {}) => {
  return Number(
    order.finalPrice ||
      order.total ||
      order.price ||
      order.subtotal ||
      0
  )
}

const getTrackingLink = (order = {}) => {
  return (
    order.trackingLink ||
    order.trackingUrl ||
    order.shippingTrackingLink ||
    ""
  )
}

export default function CustomerPortal() {
  const [orderId, setOrderId] = useState("")
  const [email, setEmail] = useState("")
  const [order, setOrder] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const lookup = async () => {
    try {
      setError("")

      const cleanOrderId = orderId.trim()
      const cleanEmail = email.trim().toLowerCase()

      if (!cleanOrderId || !cleanEmail) {
        setError("Please enter your order ID and email.")
        return
      }

      setLoading(true)

      const res = await api.post("/public/lookup", {
        orderId: cleanOrderId,
        email: cleanEmail
      })

      const foundOrder =
        res.data?.data ||
        res.data?.order ||
        res.data

      if (!foundOrder?._id) {
        throw new Error("Order not found")
      }

      setOrder(foundOrder)
      toast.success("Order found")
    } catch (err) {
      console.error("❌ ORDER LOOKUP ERROR:", err.response?.data || err)

      setOrder(null)
      setError(
        err.response?.data?.message ||
          "Order not found. Please check your order ID and email."
      )

      toast.error("Order not found")
    } finally {
      setLoading(false)
    }
  }

  const resetLookup = () => {
    setOrder(null)
    setError("")
  }

  const trackingLink = order ? getTrackingLink(order) : ""

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            📦 Track Your Order
          </h1>

          <p className="mt-3 text-slate-400">
            Enter your order ID and email to view your order status, timeline, and tracking updates.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl shadow-black/20">
          {!order ? (
            <>
              <div className="grid gap-4">
                <input
                  placeholder="Order ID"
                  value={orderId}
                  onChange={(event) => setOrderId(event.target.value)}
                  className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
                />

                <button
                  type="button"
                  onClick={lookup}
                  disabled={loading}
                  className="rounded-2xl bg-cyan-500 px-5 py-4 font-black text-black transition hover:bg-cyan-400 disabled:opacity-60"
                >
                  {loading ? "Looking Up..." : "Lookup Order"}
                </button>
              </div>

              {error && (
                <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
                  {error}
                </p>
              )}
            </>
          ) : (
            <div>
              <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 md:flex-row md:items-start">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Customer
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {order.customerName || "Customer"}
                  </h2>

                  <p className="mt-1 text-slate-400">
                    {order.email || email}
                  </p>
                </div>

                <span className="w-fit rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-300">
                  {formatStatus(order.status)}
                </span>
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-3">
                <DetailBox
                  label="Order"
                  value={`#${String(order._id || "").slice(-6).toUpperCase()}`}
                />

                <DetailBox
                  label="Total"
                  value={money(getOrderTotal(order))}
                />

                <DetailBox
                  label="Tracking"
                  value={order.trackingNumber || "Not added yet"}
                />
              </div>

              {order.items?.length > 0 && (
                <div className="mb-6 rounded-2xl border border-slate-800 bg-[#020617] p-5">
                  <h2 className="mb-4 text-xl font-bold">
                    Items
                  </h2>

                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={`${item.name || "item"}-${index}`}
                        className="flex flex-wrap justify-between gap-3 border-b border-slate-800 pb-3 text-sm last:border-b-0"
                      >
                        <span>
                          {item.name || "Item"} × {item.quantity || 1}
                        </span>

                        <span className="text-cyan-300">
                          {money(
                            Number(item.price || 0) *
                              Number(item.quantity || 1)
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6 rounded-2xl border border-slate-800 bg-[#020617] p-5">
                <h2 className="mb-4 text-xl font-bold">
                  Timeline
                </h2>

                <Timeline timeline={order.timeline || []} />
              </div>

              {order.trackingNumber && (
                <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-300">
                  <p className="font-bold">
                    🚚 Tracking #: {order.trackingNumber}
                  </p>

                  {trackingLink && (
                    <a
                      href={trackingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block underline"
                    >
                      Track Package
                    </a>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={resetLookup}
                  className="rounded-full border border-slate-700 px-5 py-3 font-bold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
                >
                  Lookup Another Order
                </button>

                {order.paymentUrl &&
                  order.status === "payment_required" && (
                    <a
                      href={order.paymentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-yellow-400 px-5 py-3 font-bold text-black transition hover:bg-yellow-300"
                    >
                      Pay Now
                    </a>
                  )}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
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