import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { io } from "socket.io-client"
import api from "../services/api"

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const SOCKET_URL = API_URL.replace(/\/api\/?$/, "")

const steps = [
  "payment_required",
  "ready_for_production",
  "production",
  "shipping",
  "shipped",
  "delivered"
]

const stepIcons = {
  quotes: "📝",
  payment_required: "💳",
  ready_for_production: "🎨",
  production: "🏭",
  shipping: "📦",
  shipped: "🚚",
  delivered: "✅"
}

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
  return payload?.data || payload?.order || payload || null
}

const resolveFileUrl = (value = "") => {
  if (!value || typeof value !== "string") return ""

  if (value.startsWith("http")) return value
  if (value.startsWith("/uploads")) return `${SOCKET_URL}${value}`
  if (value.startsWith("uploads")) return `${SOCKET_URL}/${value}`

  return `${SOCKET_URL}/uploads/${value}`
}

export default function TrackOrder() {
  const { id } = useParams()

  const socketRef = useRef(null)

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      if (!id || id === "null" || id === "undefined") {
        throw new Error("Missing order ID")
      }

      const res = await api.get(`/orders/${id}`)

      const loadedOrder = normalizeOrder(res.data)

      setOrder(loadedOrder)

      if (loadedOrder?._id) {
        localStorage.setItem("lastOrderId", loadedOrder._id)
      }
    } catch (err) {
      console.error("❌ LOAD ORDER ERROR:", err.response?.data || err)

      setOrder(null)
      setError(
        err.response?.data?.message ||
          err.message ||
          "Order not found"
      )
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const timer = setTimeout(() => {
      load()
    }, 0)

    return () => clearTimeout(timer)
  }, [load])

  useEffect(() => {
    if (!id || id === "null" || id === "undefined") return

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnection: true
      })
    }

    const socket = socketRef.current

    const handleOrderUpdated = (data = {}) => {
      const incomingOrderId =
        data.orderId ||
        data._id ||
        data.order?._id ||
        data.data?._id

      if (incomingOrderId !== id) return

      console.log("⚡ LIVE ORDER UPDATE:", data)

      load()
    }

    socket.on("orderUpdated", handleOrderUpdated)
    socket.on("orderStatusUpdated", handleOrderUpdated)

    return () => {
      socket.off("orderUpdated", handleOrderUpdated)
      socket.off("orderStatusUpdated", handleOrderUpdated)
    }
  }, [id, load])

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [])

  const currentStep = useMemo(() => {
    const status = order?.status

    const index = steps.indexOf(status)

    return index === -1 ? 0 : index
  }, [order?.status])

  const progress = ((currentStep + 1) / steps.length) * 100

  const artworkUrl = resolveFileUrl(
    order?.artwork ||
      order?.artworkUrl ||
      order?.proofUrl ||
      order?.fileUrl ||
      ""
  )

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        Loading order...
      </main>
    )
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
        <section className="mx-auto max-w-3xl rounded-3xl border border-red-500/40 bg-red-950/40 p-8 text-center text-red-300">
          <h1 className="mb-3 text-3xl font-bold">
            Order Not Found
          </h1>

          <p>{error || "This order could not be loaded."}</p>

          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-cyan-500 px-6 py-3 font-bold text-black transition hover:bg-cyan-400"
          >
            Return Home
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            📦 Track Order
          </h1>

          <p className="mt-3 text-slate-400">
            Follow your order from payment to production, shipping, and delivery.
          </p>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl shadow-black/20">
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <InfoBox
              label="Order"
              value={`#${String(order._id || id).slice(-6).toUpperCase()}`}
            />

            <InfoBox
              label="Customer"
              value={order.customerName || "Customer"}
            />

            <InfoBox
              label="Status"
              value={formatStatus(order.status)}
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

          <div className="mb-10 grid gap-4 md:grid-cols-6">
            {steps.map((step, index) => {
              const complete = index <= currentStep

              return (
                <div
                  key={step}
                  className={
                    complete
                      ? "rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-emerald-300"
                      : "rounded-2xl border border-slate-800 bg-[#020617] p-4 text-center text-slate-500"
                  }
                >
                  <div className="mb-2 text-2xl">
                    {complete ? "✓" : stepIcons[step]}
                  </div>

                  <p className="text-xs font-bold">
                    {formatStatus(step)}
                  </p>
                </div>
              )
            })}
          </div>

          {order.status === "production" && (
            <StatusMessage color="text-yellow-300">
              🏭 Your order is currently in production.
            </StatusMessage>
          )}

          {order.status === "shipping" && (
            <StatusMessage color="text-blue-300">
              📦 Your order is being prepared for shipment.
            </StatusMessage>
          )}

          {order.status === "shipped" && (
            <StatusMessage color="text-emerald-300">
              🚚 Your order has shipped.
            </StatusMessage>
          )}

          {order.items?.length > 0 && (
            <div className="mt-8 rounded-2xl border border-slate-800 bg-[#020617] p-5">
              <h2 className="mb-4 text-xl font-bold">
                🧾 Items
              </h2>

              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={`${item.name || "item"}-${index}`}
                    className="rounded-xl border border-slate-800 bg-slate-950/80 p-4"
                  >
                    <div className="font-semibold">
                      {item.name || "Item"}
                    </div>

                    <div className="mt-1 text-sm text-slate-500">
                      {item.variant?.color || "N/A"} /{" "}
                      {item.variant?.size || "N/A"}
                    </div>

                    <div className="mt-1 text-sm">
                      Qty: {item.quantity || 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {artworkUrl && (
            <div className="mt-8 rounded-2xl border border-slate-800 bg-[#020617] p-5">
              <h2 className="mb-4 text-xl font-bold">
                Artwork / Proof
              </h2>

              <a
                href={artworkUrl}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={artworkUrl}
                  alt="Artwork"
                  className="max-h-96 w-full rounded-xl border border-slate-800 object-contain"
                  onError={(event) => {
                    event.currentTarget.src =
                      "/image_placeholder/placeholder.png"
                  }}
                />

                <p className="mt-3 text-sm font-semibold text-cyan-300">
                  Open Artwork →
                </p>
              </a>
            </div>
          )}

          {order.timeline?.length > 0 && (
            <div className="mt-8 rounded-2xl border border-slate-800 bg-[#020617] p-5">
              <h2 className="mb-4 text-xl font-bold">
                📍 Timeline
              </h2>

              <div className="space-y-3">
                {order.timeline.map((item, index) => (
                  <div
                    key={`${item.status || "timeline"}-${index}`}
                    className="rounded-xl border border-slate-800 bg-slate-950/80 p-4"
                  >
                    <div className="font-bold">
                      {stepIcons[item.status] || "📌"}{" "}
                      {formatStatus(item.status)}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {item.date
                        ? new Date(item.date).toLocaleString()
                        : ""}
                    </div>

                    {item.note && (
                      <div className="mt-2 text-sm text-slate-400">
                        {item.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5 text-center">
            <h2 className="mb-3 text-xl font-bold">
              🚚 Shipping
            </h2>

            {order.status !== "shipped" && order.status !== "delivered" && (
              <p className="text-slate-400">
                Tracking will appear once your order ships.
              </p>
            )}

            {(order.status === "shipped" || order.status === "delivered") && (
              <>
                <p className="text-sm text-slate-400">
                  Carrier: {order.carrier || "N/A"}
                </p>

                <p className="mt-2 text-sm">
                  Tracking #: {order.trackingNumber || "N/A"}
                </p>

                {order.trackingLink && (
                  <a
                    href={order.trackingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex rounded-full bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
                  >
                    Track Package
                  </a>
                )}
              </>
            )}
          </div>
        </section>
      </section>
    </main>
  )
}

function InfoBox({ label, value }) {
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

function StatusMessage({ children, color }) {
  return (
    <div className="mt-8 rounded-2xl border border-slate-800 bg-[#020617] p-5 text-center">
      <p className={`font-bold ${color}`}>
        {children}
      </p>
    </div>
  )
}