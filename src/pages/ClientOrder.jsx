import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../services/api"

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

const statusClass = (status = "pending") => {
  const key = String(status || "pending").toLowerCase()

  if (key === "approved" || key === "paid") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
  }

  if (key === "denied") {
    return "border-red-500/30 bg-red-500/10 text-red-300"
  }

  if (key === "payment_required") {
    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
  }

  return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
}

const normalizeOrder = (payload) => {
  return (
    payload?.data ||
    payload?.order ||
    payload ||
    null
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

export default function ClientOrder() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingAction, setSavingAction] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setError("")

        if (!id || id === "null" || id === "undefined") {
          throw new Error("Invalid order ID")
        }

        const res = await api.get(`/orders/${id}/client`)

        if (!mounted) return

        setOrder(normalizeOrder(res.data))
      } catch (err) {
        if (!mounted) return

        console.error("❌ CLIENT ORDER ERROR:", err.response?.data || err)

        setOrder(null)
        setError(
          err.response?.data?.message ||
            err.message ||
            "Order not found"
        )
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
  }, [id])

  const totals = useMemo(() => {
    if (!order) {
      return {
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0
      }
    }

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

    return {
      subtotal,
      tax,
      shipping,
      total
    }
  }, [order])

  const reloadOrder = async () => {
    const res = await api.get(`/orders/${id}/client`)
    setOrder(normalizeOrder(res.data))
  }

  const approve = async () => {
    try {
      setSavingAction("approve")

      await api.patch(`/orders/${id}/client-approve`)

      toast.success("Order approved")
      await reloadOrder()
    } catch (err) {
      console.error("❌ APPROVE ERROR:", err.response?.data || err)

      toast.error(
        err.response?.data?.message ||
          "Approve failed"
      )
    } finally {
      setSavingAction("")
    }
  }

  const deny = async () => {
    const reason = prompt("Please enter a reason or revision note:")

    if (!reason) return

    try {
      setSavingAction("deny")

      await api.patch(`/orders/${id}/client-deny`, {
        denialReason: reason
      })

      toast.success("Revision request submitted")
      await reloadOrder()
    } catch (err) {
      console.error("❌ DENY ERROR:", err.response?.data || err)

      toast.error(
        err.response?.data?.message ||
          "Deny failed"
      )
    } finally {
      setSavingAction("")
    }
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
        <section className="mx-auto max-w-3xl rounded-3xl border border-red-500/40 bg-red-950/40 p-8 text-center text-red-300">
          <h1 className="mb-3 text-3xl font-bold">
            Order Not Found
          </h1>

          <p>{error || "This order could not be loaded."}</p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 rounded-full bg-cyan-500 px-6 py-3 font-bold text-black transition hover:bg-cyan-400"
          >
            Back Home
          </button>
        </section>
      </main>
    )
  }

  const approvalStatus =
    order.approvalStatus ||
    order.status ||
    "pending"

  const trackingLink = getTrackingLink(order)

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <h1 className="text-4xl font-extrabold">
            Order Approval
          </h1>

          <p className="mt-3 text-slate-400">
            Review your order details before approval.
          </p>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 md:flex-row md:items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Customer
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                {order.customerName ||
                  order.name ||
                  "Customer"}
              </h2>

              <p className="mt-1 text-slate-400">
                {order.email || "No email"}
              </p>
            </div>

            <span
              className={`w-fit rounded-full border px-4 py-2 text-xs font-bold ${statusClass(approvalStatus)}`}
            >
              {formatStatus(approvalStatus)}
            </span>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <DetailBox
              label="Order"
              value={`#${String(order._id || id).slice(-6).toUpperCase()}`}
            />

            <DetailBox
              label="Items"
              value={order.items?.length || 0}
            />

            <DetailBox
              label="Status"
              value={formatStatus(approvalStatus)}
            />

            <DetailBox
              label="Total"
              value={money(totals.total)}
            />
          </div>

          <div className="mb-6 rounded-2xl border border-slate-800 bg-[#020617] p-5">
            <h2 className="mb-4 text-xl font-bold">
              Order Items
            </h2>

            {order.items?.length ? (
              <div className="space-y-3">
                {order.items.map((item, index) => {
                  const qty = Number(item.quantity || 1)
                  const price = Number(item.price || 0)

                  return (
                    <div
                      key={`${item.name || "item"}-${index}`}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 last:border-b-0"
                    >
                      <div>
                        <p className="font-bold">
                          {item.name || "Item"}
                        </p>

                        <p className="text-sm text-slate-500">
                          {item.variant?.color ||
                            item.selectedVariant?.color ||
                            "-"}
                          {" / "}
                          {item.variant?.size ||
                            item.selectedVariant?.size ||
                            "-"}
                        </p>
                      </div>

                      <p className="text-slate-300">
                        {qty} × {money(price)}
                      </p>

                      <p className="font-bold text-cyan-300">
                        {money(qty * price)}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-slate-500">
                No items listed.
              </p>
            )}
          </div>

          <div className="mb-6 rounded-2xl border border-slate-800 bg-[#020617] p-5">
            <h2 className="mb-4 text-xl font-bold">
              Summary
            </h2>

            <SummaryRow
              label="Subtotal"
              value={money(totals.subtotal)}
            />

            <SummaryRow
              label="Tax"
              value={money(totals.tax)}
            />

            <SummaryRow
              label="Shipping"
              value={money(totals.shipping)}
            />

            <SummaryRow
              label="Total"
              value={money(totals.total)}
              strong
            />
          </div>

          {approvalStatus === "pending" && (
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={approve}
                disabled={savingAction === "approve"}
                className="rounded-2xl bg-emerald-500 px-5 py-4 text-lg font-black text-black transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {savingAction === "approve"
                  ? "Approving..."
                  : "✅ Approve Order"}
              </button>

              <button
                type="button"
                onClick={deny}
                disabled={savingAction === "deny"}
                className="rounded-2xl bg-red-500 px-5 py-4 text-lg font-black text-white transition hover:bg-red-400 disabled:opacity-60"
              >
                {savingAction === "deny"
                  ? "Submitting..."
                  : "❌ Request Changes"}
              </button>
            </div>
          )}

          {approvalStatus !== "pending" && (
            <div className="rounded-2xl border border-slate-800 bg-[#020617] p-5 text-center">
              <p className="font-bold text-cyan-300">
                Current approval status: {formatStatus(approvalStatus)}
              </p>
            </div>
          )}

          {trackingLink && (
            <a
              href={trackingLink}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex w-full justify-center rounded-2xl border border-cyan-400/40 px-5 py-4 font-bold text-cyan-300 transition hover:bg-cyan-400 hover:text-black"
            >
              Track Package
            </a>
          )}
        </section>
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

function SummaryRow({
  label,
  value,
  strong = false
}) {
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