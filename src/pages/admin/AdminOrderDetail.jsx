import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../../services/api"

const statusOptions = [
  "payment_required",
  "paid",
  "ready_for_production",
  "production",
  "shipping",
  "shipped",
  "delivered",
  "archive"
]

const priorityOptions = [
  {
    value: "low",
    label: "🟢 Low"
  },
  {
    value: "medium",
    label: "🟡 Medium"
  },
  {
    value: "high",
    label: "🔴 High"
  }
]

const money = (value = 0) =>
  Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })

const formatStatus = (value = "") =>
  String(value || "unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())

const formatDateInput = (value = "") => {
  if (!value) return ""

  return String(value).slice(0, 10)
}

const formatDateDisplay = (value = "") => {
  if (!value) return "Not set"

  return new Date(value).toLocaleDateString()
}

const getPriorityLabel = (priority = "medium") => {
  return (
    priorityOptions.find((option) => option.value === priority)?.label ||
    "🟡 Medium"
  )
}

const isOverdue = (dueDate = "") => {
  if (!dueDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  return due < today
}

export default function AdminOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [status, setStatus] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [trackingLink, setTrackingLink] = useState("")
  const [carrier, setCarrier] = useState("")

  const [priority, setPriority] = useState("medium")
  const [dueDate, setDueDate] = useState("")
  const [adminNotes, setAdminNotes] = useState("")

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true)

      const res = await api.get(`/orders/${id}`)
      const data = res.data?.data || res.data || null

      setOrder(data)

      if (data) {
        setStatus(data.status || "")
        setTrackingNumber(data.trackingNumber || "")
        setTrackingLink(data.trackingLink || "")
        setCarrier(data.carrier || "")

        setPriority(data.priority || "medium")
        setDueDate(formatDateInput(data.dueDate))
        setAdminNotes(data.adminNotes || "")
      }
    } catch (err) {
      console.error("❌ ORDER DETAIL ERROR:", err)
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrder()
    }, 0)

    return () => clearTimeout(timer)
  }, [loadOrder])

  const updateOrder = async () => {
    try {
      setSaving(true)

      const res = await api.patch(`/orders/${id}`, {
        status,
        trackingNumber,
        trackingLink,
        carrier,
        priority,
        dueDate,
        adminNotes
      })

      const updated = res.data?.data || res.data || null

      if (updated?._id) {
        setOrder(updated)
      }

      await loadOrder()
    } catch (err) {
      console.error("❌ UPDATE ORDER ERROR:", err.response?.data || err)
      alert("Could not update order.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] p-6 text-white">
        Loading order...
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#020617] p-6 text-red-400">
        Order not found.
      </main>
    )
  }

  const address = order.address || {}

  const subtotal = Number(order.subtotal || 0)
  const tax = Number(order.tax || 0)
  const shipping = Number(order.shippingCost || order.shipping || 0)
  const total = Number(order.finalPrice || order.total || subtotal + tax + shipping)

  const overdue = isOverdue(dueDate)

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <section className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate("/admin/orders")}
          className="mb-8 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
        >
          ← Back to Orders
        </button>

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              Admin Order
            </p>

            <h1 className="text-4xl font-extrabold">
              Order #{String(order._id || "").slice(-6).toUpperCase()}
            </h1>

            <p className="mt-2 text-slate-400">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString()
                : "No date"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="w-fit rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-bold text-cyan-300">
              {formatStatus(order.status)}
            </span>

            <span
              className={
                priority === "high"
                  ? "w-fit rounded-full border border-red-400/30 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-300"
                  : priority === "low"
                    ? "w-fit rounded-full border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-300"
                    : "w-fit rounded-full border border-yellow-400/30 bg-yellow-500/10 px-5 py-3 text-sm font-bold text-yellow-300"
              }
            >
              {getPriorityLabel(priority)}
            </span>

            {overdue && (
              <span className="w-fit rounded-full border border-red-400/40 bg-red-600/20 px-5 py-3 text-sm font-bold text-red-300">
                ⚠️ Overdue
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <h2 className="mb-5 text-2xl font-bold">
                Customer Information
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <Info label="Name" value={order.customerName || "Customer"} />
                <Info label="Email" value={order.email || "Not provided"} />
                <Info label="Phone" value={order.phone || "Not provided"} />
                <Info label="Source" value={order.source || "Store"} />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <h2 className="mb-5 text-2xl font-bold">
                Internal Production Details
              </h2>

              <div className="grid gap-4 md:grid-cols-3">
                <Info label="Priority" value={getPriorityLabel(priority)} />
                <Info label="Internal Due Date" value={formatDateDisplay(dueDate)} />
                <Info label="Overdue" value={overdue ? "Yes" : "No"} />
              </div>

              <div className="mt-5 rounded-2xl border border-slate-800 bg-[#020617] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Admin Notes
                </p>

                <p className="mt-2 whitespace-pre-wrap text-slate-300">
                  {adminNotes || "No internal notes yet."}
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <h2 className="mb-5 text-2xl font-bold">
                Items
              </h2>

              {order.items?.length ? (
                <div className="space-y-4">
                  {order.items.map((item, index) => {
                    const quantity = Number(item.quantity || 1)
                    const price = Number(item.price || 0)

                    return (
                      <div
                        key={`${item.name || "item"}-${index}`}
                        className="rounded-2xl border border-slate-800 bg-[#020617] p-4"
                      >
                        <h3 className="font-bold">
                          {item.name || "Item"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          {item.variant?.color ||
                            item.selectedVariant?.color ||
                            "-"}{" "}
                          /{" "}
                          {item.variant?.size ||
                            item.selectedVariant?.size ||
                            "-"}
                        </p>

                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                          <Info label="Qty" value={quantity} />
                          <Info label="Price" value={money(price)} />
                          <Info label="Line Total" value={money(quantity * price)} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-slate-400">
                  No items found.
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <h2 className="mb-5 text-2xl font-bold">
                Update Order
              </h2>

              <label className="mb-2 block text-sm font-bold text-slate-300">
                Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mb-4 w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatStatus(option)}
                  </option>
                ))}
              </select>

              <label className="mb-2 block text-sm font-bold text-slate-300">
                Priority
              </label>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mb-4 w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <label className="mb-2 block text-sm font-bold text-slate-300">
                Internal Due Date
              </label>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mb-4 w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white"
              />

              <label className="mb-2 block text-sm font-bold text-slate-300">
                Admin Notes
              </label>

              <textarea
                rows={4}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Production notes, customer requests, materials needed..."
                className="mb-4 w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white"
              />

              <input
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="Carrier"
                className="mb-4 w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white"
              />

              <input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Tracking Number"
                className="mb-4 w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white"
              />

              <input
                value={trackingLink}
                onChange={(e) => setTrackingLink(e.target.value)}
                placeholder="Tracking Link"
                className="mb-4 w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white"
              />

              <button
                type="button"
                onClick={updateOrder}
                disabled={saving}
                className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-bold text-black hover:bg-cyan-400 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Updates"}
              </button>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <h2 className="mb-5 text-2xl font-bold">
                Order Summary
              </h2>

              <Summary label="Subtotal" value={money(subtotal)} />
              <Summary label="Tax" value={money(tax)} />
              <Summary label="Shipping" value={money(shipping)} />
              <Summary label="Total" value={money(total)} strong />
              <Summary label="Profit" value={money(order.profit)} />
              <Summary label="Margin" value={`${Number(order.margin || 0).toFixed(2)}%`} />
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <h2 className="mb-5 text-2xl font-bold">
                Shipping Address
              </h2>

              {address.street ? (
                <div className="text-slate-300">
                  <p>{address.street}</p>
                  <p>
                    {address.city}, {address.state} {address.zip}
                  </p>
                  <p>{address.country || "US"}</p>
                </div>
              ) : (
                <p className="text-slate-400">
                  No address provided.
                </p>
              )}
            </section>
          </aside>
        </div>
      </section>
    </main>
  )
}

function Info({ label, value }) {
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

function Summary({ label, value, strong = false }) {
  return (
    <div className="flex justify-between border-b border-slate-800 py-3 last:border-b-0">
      <span className="text-slate-400">
        {label}
      </span>

      <span className={strong ? "text-xl font-extrabold text-cyan-300" : "font-bold"}>
        {value}
      </span>
    </div>
  )
}