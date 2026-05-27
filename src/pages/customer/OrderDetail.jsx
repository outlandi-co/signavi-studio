import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { io } from "socket.io-client"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import api from "../../services/api"

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const SOCKET_URL = API_URL.replace(/\/api\/?$/, "")

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

const getItemImage = (item = {}) => {
  return (
    item.image ||
    item.imageUrl ||
    item.product?.image ||
    item.product?.imageUrl ||
    item.selectedVariant?.image ||
    item.variant?.image ||
    item.images?.[0] ||
    item.product?.images?.[0] ||
    ""
  )
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const invalidId = !id || id === "null" || id === "undefined"

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(!invalidId)

  const socketRef = useRef(null)

  const loadOrder = async () => {
    if (invalidId) return

    try {
      const res = await api.get(`/orders/${id}`)
      const data = res.data?.data || res.data

      if (data?._id) {
        setOrder(data)
      } else {
        setOrder(null)
      }
    } catch (err) {
      console.error("❌ ORDER LOAD ERROR:", err.response?.data || err)
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (invalidId) {
      console.warn("⚠️ Invalid order ID:", id)
      return
    }

    const timer = setTimeout(() => {
      loadOrder()
    }, 0)

    return () => clearTimeout(timer)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, invalidId])

  useEffect(() => {
    if (invalidId) return

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"]
      })
    }

    const socket = socketRef.current

    const handleSocketUpdate = (updatedOrder) => {
      if (updatedOrder?._id === id) {
        setOrder(updatedOrder)
      }
    }

    socket.on("jobUpdated", handleSocketUpdate)
    socket.on("orderUpdated", handleSocketUpdate)

    return () => {
      socket.off("jobUpdated", handleSocketUpdate)
      socket.off("orderUpdated", handleSocketUpdate)
    }
  }, [id, invalidId])

  useEffect(() => {
    if (invalidId) return

    const interval = setInterval(() => {
      loadOrder()
    }, 30000)

    return () => clearInterval(interval)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, invalidId])

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [])

  const handleDownloadInvoice = async () => {
    if (!order) return

    try {
      const input = document.getElementById("invoice")
      if (!input) return

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true
      })

      const imgData = canvas.toDataURL("image/png")

      const pdf = new jsPDF("p", "mm", "a4")
      const width = pdf.internal.pageSize.getWidth()
      const height = (canvas.height * width) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, width, height)
      pdf.save(`invoice-${order._id}.pdf`)
    } catch (err) {
      console.error("❌ PDF ERROR:", err)
    }
  }

  if (invalidId) {
    return (
      <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
        <ErrorBox message="Order not found or invalid ID." />
      </main>
    )
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        Loading order...
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
        <ErrorBox message="Order not found or invalid ID." />
      </main>
    )
  }

  const status = order.status || "pending"

  const subtotal = Number(order.subtotal || 0)
  const tax = Number(order.tax || 0)
  const shipping = Number(order.shippingCost || order.shipping || 0)
  const total = Number(
    order.finalPrice ||
      order.total ||
      subtotal + tax + shipping ||
      0
  )

  const paymentUrl =
    order.paymentUrl ||
    order.squarePaymentUrl ||
    order.checkoutUrl ||
    ""

  const trackingLink =
    order.trackingLink ||
    order.trackingUrl ||
    order.shippingTrackingLink ||
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

  const canShowReceipt =
    receiptUrl &&
    paidStatuses.includes(status)

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate("/my-orders")}
          className="mb-8 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
        >
          ← Back To Orders
        </button>

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              Order Details
            </p>

            <h1 className="text-4xl font-extrabold md:text-5xl">
              Order #{String(order._id || "").slice(-6).toUpperCase()}
            </h1>

            <p className="mt-3 text-slate-400">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString()
                : "No date available"}
            </p>
          </div>

          <span
            className={`w-fit rounded-full border px-5 py-3 text-sm font-bold ${
              statusStyles[status] ||
              "border-slate-500/30 bg-slate-500/10 text-slate-300"
            }`}
          >
            {formatStatus(status)}
          </span>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
              <h2 className="mb-5 text-2xl font-bold">
                Production Timeline
              </h2>

              <Timeline status={status} />
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
              <h2 className="mb-5 text-2xl font-bold">
                Order Items
              </h2>

              {order.items?.length > 0 ? (
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <OrderItem
                      key={`${item.name || "item"}-${index}`}
                      item={item}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">
                  No order items found.
                </p>
              )}
            </section>

            <section
              id="invoice"
              className="rounded-3xl border border-slate-800 bg-white p-8 text-black shadow-xl shadow-black/20"
            >
              <div className="mb-6 flex flex-col justify-between gap-4 border-b border-black pb-5 md:flex-row">
                <div>
                  <h2 className="text-2xl font-bold">
                    SignaVi Studio
                  </h2>

                  <p>www.signavistudio.store</p>
                  <p>support@signavistudio.store</p>
                </div>

                <div className="text-left md:text-right">
                  <h2 className="text-2xl font-bold">
                    INVOICE
                  </h2>

                  <p>
                    #{String(order._id || "").slice(-6).toUpperCase()}
                  </p>

                  <p>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="mb-5 grid gap-3 md:grid-cols-2">
                <p>
                  <strong>Customer:</strong>{" "}
                  {order.customerName || "Customer"}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {order.email || "N/A"}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {formatStatus(status)}
                </p>

                <p>
                  <strong>Order ID:</strong>{" "}
                  {order._id}
                </p>
              </div>

              <hr className="my-5" />

              {order.items?.length > 0 ? (
                <div className="space-y-4">
                  {order.items.map((item, index) => {
                    const quantity = Number(item.quantity || 1)
                    const price = Number(item.price || 0)
                    const lineTotal = quantity * price

                    return (
                      <div
                        key={`${item.name || "invoice-item"}-${index}`}
                        className="border-b border-slate-300 pb-3"
                      >
                        <p>
                          <strong>{item.name || "Item"}</strong>
                        </p>

                        <p>
                          {item.variant?.color ||
                            item.selectedVariant?.color ||
                            "N/A"}{" "}
                          /{" "}
                          {item.variant?.size ||
                            item.selectedVariant?.size ||
                            "N/A"}
                        </p>

                        <p>
                          Qty: {quantity} × {money(price)}
                        </p>

                        <p>
                          Line Total: {money(lineTotal)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p>No order items found.</p>
              )}

              <div className="mt-6 space-y-2 text-right">
                <p>
                  Subtotal: {money(subtotal)}
                </p>

                <p>
                  Tax: {money(tax)}
                </p>

                <p>
                  Shipping: {money(shipping)}
                </p>

                <h3 className="text-2xl font-bold">
                  Total: {money(total)}
                </h3>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
              <h2 className="mb-5 text-2xl font-bold">
                Order Summary
              </h2>

              <SummaryRow label="Subtotal" value={money(subtotal)} />
              <SummaryRow label="Tax" value={money(tax)} />
              <SummaryRow label="Shipping" value={money(shipping)} />
              <SummaryRow label="Total" value={money(total)} strong />
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
              <h2 className="mb-5 text-2xl font-bold">
                Tracking
              </h2>

              <SummaryRow
                label="Carrier"
                value={order.carrier || "Not added yet"}
              />

              <SummaryRow
                label="Tracking #"
                value={order.trackingNumber || "Not added yet"}
              />

              {trackingLink && (
                <a
                  href={trackingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-full justify-center rounded-xl border border-cyan-400/40 px-4 py-3 font-bold text-cyan-300 transition hover:bg-cyan-400 hover:text-black"
                >
                  Track Package
                </a>
              )}
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
              <h2 className="mb-5 text-2xl font-bold">
                Actions
              </h2>

              <div className="grid gap-3">
                {paymentUrl && status === "payment_required" && (
                  <a
                    href={paymentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-yellow-400 px-4 py-3 text-center font-bold text-black transition hover:bg-yellow-300"
                  >
                    Pay Now
                  </a>
                )}

                {invoiceId && (
                  <button
                    type="button"
                    onClick={() => navigate(`/invoice/${invoiceId}`)}
                    className="rounded-xl border border-slate-700 px-4 py-3 font-bold text-white transition hover:border-cyan-400 hover:text-cyan-300"
                  >
                    View Invoice
                  </button>
                )}

                {invoiceUrl && (
                  <a
                    href={invoiceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-700 px-4 py-3 text-center font-bold text-white transition hover:border-cyan-400 hover:text-cyan-300"
                  >
                    Download Invoice
                  </a>
                )}

                {canShowReceipt && (
                  <a
                    href={receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-700 px-4 py-3 text-center font-bold text-white transition hover:border-cyan-400 hover:text-cyan-300"
                  >
                    Download Receipt
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleDownloadInvoice}
                  className="rounded-xl bg-cyan-500 px-4 py-3 font-bold text-black transition hover:bg-cyan-400"
                >
                  Download PDF
                </button>

                <Link
                  to="/my-support"
                  className="rounded-xl border border-slate-700 px-4 py-3 text-center font-bold text-white transition hover:border-cyan-400 hover:text-cyan-300"
                >
                  Contact Support
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  )
}

function OrderItem({ item }) {
  const image = getItemImage(item)
  const quantity = Number(item.quantity || 1)
  const price = Number(item.price || 0)

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-[#020617] p-4 sm:flex-row">
      <img
        src={image || "/image_placeholder/placeholder.png"}
        alt={item.name || "Order item"}
        className="h-28 w-28 rounded-2xl object-cover"
        onError={(event) => {
          event.currentTarget.src = "/image_placeholder/placeholder.png"
        }}
      />

      <div className="flex-1">
        <h3 className="text-lg font-bold">
          {item.name || "Item"}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {item.variant?.color ||
            item.selectedVariant?.color ||
            "No color"}{" "}
          /{" "}
          {item.variant?.size ||
            item.selectedVariant?.size ||
            "No size"}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <DetailBox label="Qty" value={quantity} />
          <DetailBox label="Price" value={money(price)} />
          <DetailBox label="Total" value={money(quantity * price)} />
        </div>
      </div>
    </div>
  )
}

function Timeline({ status }) {
  const normalizedStatus =
    status === "shipped"
      ? "shipping"
      : status

  const activeIndex =
    timelineSteps.indexOf(normalizedStatus)

  return (
    <div>
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

      <p className="mt-4 text-sm text-slate-400">
        Current status:{" "}
        <span className="font-bold text-cyan-300">
          {formatStatus(status)}
        </span>
      </p>
    </div>
  )
}

function DetailBox({ label, value }) {
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

function SummaryRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 py-3 last:border-b-0">
      <span className="text-slate-400">
        {label}
      </span>

      <span
        className={
          strong
            ? "text-xl font-extrabold text-cyan-300"
            : "font-bold text-white"
        }
      >
        {value}
      </span>
    </div>
  )
}

function ErrorBox({ message }) {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-red-500/40 bg-red-950/40 p-8 text-center text-red-300">
      {message}
    </div>
  )
}