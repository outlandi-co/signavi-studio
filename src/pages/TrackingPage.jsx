import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import api from "../services/api"
import { getSocket } from "../services/socket"

const steps = [
  {
    key: "payment_required",
    label: "Payment Required"
  },
  {
    key: "paid",
    label: "Paid"
  },
  {
    key: "ready_for_production",
    label: "Ready"
  },
  {
    key: "production",
    label: "Production"
  },
  {
    key: "shipping",
    label: "Shipping"
  },
  {
    key: "shipped",
    label: "Shipped"
  },
  {
    key: "delivered",
    label: "Delivered"
  }
]

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const formatStatus = (status = "") => {
  return String(status || "Processing")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const normalizeOrder = (payload) => {
  return (
    payload?.data ||
    payload?.order ||
    payload ||
    null
  )
}

const getTrackingUrl = (order = {}) => {
  return (
    order.trackingLink ||
    order.trackingUrl ||
    order.shippingTrackingLink ||
    ""
  )
}

export default function TrackingPage() {
  const { id: paramId } = useParams()

  const [order, setOrder] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const orderId = useMemo(() => {
    const storedId =
      localStorage.getItem("lastOrderId")

    return paramId &&
      paramId !== "null" &&
      paramId !== "undefined"
      ? paramId
      : storedId
  }, [paramId])

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      if (!orderId) {
        throw new Error("Missing order ID")
      }

      const res = await api.get(`/orders/${orderId}`)
      const data = normalizeOrder(res.data)

      setOrder(data)

      if (data?._id) {
        localStorage.setItem("lastOrderId", data._id)
      }
    } catch (err) {
      console.error("❌ TRACKING ERROR:", err.response?.data || err)

      setOrder(null)
      setError(
        err.response?.data?.message ||
          err.message ||
          "Order not found"
      )
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrder()
    }, 0)

    return () => clearTimeout(timer)
  }, [fetchOrder])

  useEffect(() => {
    if (!orderId) return

    const socket = getSocket()

    const handleOrderUpdated = (data = {}) => {
      const incomingOrderId =
        data.orderId ||
        data._id ||
        data.order?._id

      if (incomingOrderId !== orderId) return

      const updatedOrder =
        data.order ||
        data.data ||
        data

      console.log("⚡ LIVE ORDER UPDATE:", updatedOrder)

      setOrder((prev) => ({
        ...prev,
        ...updatedOrder
      }))
    }

    socket.on("orderUpdated", handleOrderUpdated)
    socket.on("orderStatusUpdated", handleOrderUpdated)

    return () => {
      socket.off("orderUpdated", handleOrderUpdated)
      socket.off("orderStatusUpdated", handleOrderUpdated)
    }
  }, [orderId])

  const currentStepIndex = useMemo(() => {
    const index = steps.findIndex(
      (step) => step.key === order?.status
    )

    return index === -1 ? 0 : index
  }, [order?.status])

  const progress =
    ((currentStepIndex + 1) / steps.length) * 100

  const trackingUrl = getTrackingUrl(order || {})

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] px-6 py-16 text-white">
        Loading order...
      </main>
    )
  }

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
            Follow your order from payment to delivery.
          </p>
        </div>

        {error && (
          <div className="rounded-3xl border border-red-500/40 bg-red-950/40 p-8 text-center text-red-300">
            <h2 className="mb-3 text-2xl font-bold">
              {error}
            </h2>

            <Link
              to="/"
              className="mt-4 inline-flex rounded-full bg-cyan-500 px-6 py-3 font-bold text-black transition hover:bg-cyan-400"
            >
              Return Home
            </Link>
          </div>
        )}

        {order && (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl shadow-black/20">
            <div className="mb-8 grid gap-4 md:grid-cols-4">
              <InfoBox
                label="Order"
                value={`#${String(order._id || orderId).slice(-6).toUpperCase()}`}
              />

              <InfoBox
                label="Status"
                value={formatStatus(order.status)}
              />

              <InfoBox
                label="Customer"
                value={order.customerName || "Customer"}
              />

              <InfoBox
                label="Total"
                value={money(order.finalPrice || order.total)}
              />
            </div>

            <div className="mb-10">
              <div className="mb-4 flex justify-between text-sm text-slate-400">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${progress}%`
                  }}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
              {steps.map((step, index) => {
                const complete = index <= currentStepIndex

                return (
                  <div
                    key={step.key}
                    className={
                      complete
                        ? "rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-emerald-300"
                        : "rounded-2xl border border-slate-800 bg-[#020617] p-4 text-center text-slate-500"
                    }
                  >
                    <div className="mb-2 text-2xl">
                      {complete ? "✓" : "•"}
                    </div>

                    <p className="text-xs font-bold">
                      {step.label}
                    </p>
                  </div>
                )
              })}
            </div>

            {order.trackingNumber && (
              <div className="mt-8 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5 text-center">
                <p className="font-bold text-cyan-300">
                  Tracking Number: {order.trackingNumber}
                </p>

                {trackingUrl && (
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex rounded-full bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
                  >
                    Track Package
                  </a>
                )}
              </div>
            )}

            {order.items?.length > 0 && (
              <div className="mt-8 rounded-2xl border border-slate-800 bg-[#020617] p-5">
                <h2 className="mb-4 text-xl font-bold">
                  Items
                </h2>

                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={`${item.name || "item"}-${index}`}
                      className="flex justify-between border-b border-slate-800 pb-3 last:border-b-0"
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
          </div>
        )}
      </section>
    </main>
  )
}

function InfoBox({
  label,
  value
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#020617] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-white">
        {value || "N/A"}
      </p>
    </div>
  )
}