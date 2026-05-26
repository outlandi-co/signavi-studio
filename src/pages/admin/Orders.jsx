import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

const STATUS_LIST = [
  "payment_required",
  "paid",
  "ready_for_production",
  "production",
  "shipping",
  "shipped",
  "delivered",
  "archive"
]

const PAID_STATUSES = [
  "paid",
  "ready_for_production",
  "production",
  "shipping",
  "shipped",
  "delivered"
]

const statusStyles = {
  payment_required: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  ready_for_production: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  production: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  shipping: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  shipped: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
  delivered: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  archive: "border-slate-500/30 bg-slate-500/10 text-slate-300"
}

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

export default function Orders() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [updating, setUpdating] = useState(false)

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
        console.error("❌ LOAD ORDERS ERROR:", err)

        if (isMounted) {
          setOrders([])
        }
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

  const filteredOrders = useMemo(() => {
    let data = Array.isArray(orders) ? [...orders] : []

    if (statusFilter !== "all") {
      data = data.filter((order) => order.status === statusFilter)
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase()

      data = data.filter((order) => {
        return (
          String(order._id || "").toLowerCase().includes(term) ||
          String(order.customerName || "").toLowerCase().includes(term) ||
          String(order.email || "").toLowerCase().includes(term) ||
          String(order.phone || "").toLowerCase().includes(term)
        )
      })
    }

    return data
  }, [orders, search, statusFilter])

  const totalRevenue = orders.reduce((sum, order) => {
    return sum + Number(order.finalPrice || order.total || 0)
  }, 0)

  const paidOrders = orders.filter((order) =>
    PAID_STATUSES.includes(order.status)
  )

  const awaitingPayment = orders.filter(
    (order) => order.status === "payment_required"
  )

  const formatDate = (value) => {
    if (!value) return "-"

    return new Date(value).toLocaleDateString()
  }

  const updateStatus = async (id, status) => {
    try {
      setUpdating(true)

      const res = await api.patch(`/orders/${id}/status`, {
        status
      })

      const updatedOrder =
        res.data?.data ||
        res.data?.order ||
        res.data

      if (!updatedOrder?._id) return

      setOrders((prev) =>
        prev.map((order) =>
          order._id === id
            ? updatedOrder
            : order
        )
      )
    } catch (err) {
      console.error("❌ STATUS ERROR:", err.response?.data || err)
      alert("Could not update status.")
    } finally {
      setUpdating(false)
    }
  }

  const bulkUpdateStatus = async (status) => {
    if (selected.length === 0) return

    const confirmed = window.confirm(
      `Update ${selected.length} order(s) to ${formatStatus(status)}?`
    )

    if (!confirmed) return

    try {
      setUpdating(true)

      await Promise.all(
        selected.map((id) =>
          api.patch(`/orders/${id}/status`, {
            status
          })
        )
      )

      setOrders((prev) =>
        prev.map((order) =>
          selected.includes(order._id)
            ? {
                ...order,
                status
              }
            : order
        )
      )

      setSelected([])
    } catch (err) {
      console.error("❌ BULK STATUS ERROR:", err.response?.data || err)
      alert("Could not update selected orders.")
    } finally {
      setUpdating(false)
    }
  }

  const printAll = async (id) => {
    try {
      const res = await api.get(`/orders/${id}/print-all`)

      if (res.data?.label) {
        window.open(res.data.label)
      }

      if (res.data?.packingSlip) {
        window.open(res.data.packingSlip)
      }
    } catch (err) {
      console.error("❌ PRINT ERROR:", err)
      alert("Could not print order documents.")
    }
  }

  const printInvoice = (id) => {
    window.open(
      `https://signavi-backend.onrender.com/api/orders/${id}/invoice`,
      "_blank"
    )
  }

  const printReceipt = (id) => {
    window.open(
      `https://signavi-backend.onrender.com/api/orders/${id}/receipt`,
      "_blank"
    )
  }

  const toggleSelected = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    )
  }

  const toggleAllVisible = () => {
    const visibleIds = filteredOrders.map((order) => order._id)

    const allSelected = visibleIds.every((id) => selected.includes(id))

    if (allSelected) {
      setSelected((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      )
    } else {
      setSelected((prev) => [
        ...new Set([...prev, ...visibleIds])
      ])
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] p-6 text-white">
        Loading orders...
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
                Orders
              </h1>

              <p className="mt-3 max-w-2xl text-slate-400">
                Manage payments, production status, shipping, invoices, and
                receipts from one admin order center.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/custom-order/new")}
              className="rounded-full bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
            >
              New Custom Order
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total Orders"
            value={orders.length}
            note="All orders"
            accent="text-cyan-300"
          />

          <SummaryCard
            label="Paid / Active"
            value={paidOrders.length}
            note="Paid and in workflow"
            accent="text-emerald-300"
          />

          <SummaryCard
            label="Awaiting Payment"
            value={awaitingPayment.length}
            note="Payment required"
            accent="text-yellow-300"
          />

          <SummaryCard
            label="Revenue"
            value={money(totalRevenue)}
            note="All order totals"
            accent="text-blue-300"
          />
        </div>

        <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/20">
          <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by order ID, customer, email, or phone..."
              className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            >
              <option value="all">All Statuses</option>

              {STATUS_LIST.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>

          {selected.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-800 pt-5">
              <span className="text-sm font-bold text-cyan-300">
                {selected.length} selected
              </span>

              <button
                type="button"
                onClick={() => bulkUpdateStatus("paid")}
                disabled={updating}
                className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:opacity-60"
              >
                Mark Paid
              </button>

              <button
                type="button"
                onClick={() => bulkUpdateStatus("ready_for_production")}
                disabled={updating}
                className="rounded-full bg-blue-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-400 disabled:opacity-60"
              >
                Ready For Production
              </button>

              <button
                type="button"
                onClick={() => bulkUpdateStatus("production")}
                disabled={updating}
                className="rounded-full bg-purple-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-purple-400 disabled:opacity-60"
              >
                Production
              </button>

              <button
                type="button"
                onClick={() => bulkUpdateStatus("archive")}
                disabled={updating}
                className="rounded-full border border-slate-700 px-4 py-2 text-sm font-bold text-white transition hover:border-red-400 hover:text-red-300 disabled:opacity-60"
              >
                Archive
              </button>
            </div>
          )}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-10 text-center">
            <h2 className="mb-3 text-2xl font-bold">
              No Orders Found
            </h2>

            <p className="text-slate-400">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-xl shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="bg-[#020617] text-sm text-slate-400">
                  <tr>
                    <th className="p-4">
                      <input
                        type="checkbox"
                        checked={
                          filteredOrders.length > 0 &&
                          filteredOrders.every((order) =>
                            selected.includes(order._id)
                          )
                        }
                        onChange={toggleAllVisible}
                      />
                    </th>

                    <th className="p-4">Order</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created</th>
                    <th className="p-4">Paid</th>
                    <th className="p-4">Tracking</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => {
                    const paid = PAID_STATUSES.includes(order.status)
                    const total = Number(
                      order.finalPrice ||
                        order.total ||
                        order.subtotal ||
                        0
                    )

                    return (
                      <tr
                        key={order._id}
                        className="border-t border-slate-800 text-sm transition hover:bg-cyan-400/5"
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selected.includes(order._id)}
                            onChange={() => toggleSelected(order._id)}
                          />
                        </td>

                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/admin/order/${order._id}`)
                            }
                            className="font-mono font-bold text-cyan-300 hover:text-cyan-200"
                          >
                            #{String(order._id || "").slice(-6).toUpperCase()}
                          </button>
                        </td>

                        <td className="p-4">
                          <p className="font-bold text-white">
                            {order.customerName || "Unknown"}
                          </p>

                          <p className="text-xs text-slate-500">
                            {order.email || "No email"}
                          </p>

                          <p className="text-xs text-slate-500">
                            {order.orderType || order.source || "store"}
                          </p>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-col gap-2">
                            <span
                              className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${
                                statusStyles[order.status] ||
                                "border-slate-500/30 bg-slate-500/10 text-slate-300"
                              }`}
                            >
                              {formatStatus(order.status)}
                            </span>

                            <select
                              value={order.status || ""}
                              onChange={(event) =>
                                updateStatus(order._id, event.target.value)
                              }
                              disabled={updating}
                              className="rounded-xl border border-slate-700 bg-[#020617] px-3 py-2 text-xs text-white"
                            >
                              {STATUS_LIST.map((status) => (
                                <option key={status} value={status}>
                                  {formatStatus(status)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        <td className="p-4 text-xs text-slate-400">
                          {formatDate(order.createdAt)}
                        </td>

                        <td className="p-4 text-xs text-slate-400">
                          {formatDate(order.paidAt)}
                        </td>

                        <td className="p-4 text-xs text-slate-300">
                          {order.trackingNumber || "Not shipped"}
                        </td>

                        <td className="p-4 font-bold text-emerald-300">
                          {money(total)}
                        </td>

                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/admin/order/${order._id}`)
                              }
                              className="rounded-full bg-purple-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-purple-400"
                            >
                              View
                            </button>

                            {order.orderType === "custom" ? (
                              <button
                                type="button"
                                onClick={() => printInvoice(order._id)}
                                className="rounded-full bg-emerald-500 px-3 py-2 text-xs font-bold text-black transition hover:bg-emerald-400"
                              >
                                Invoice
                              </button>
                            ) : (
                              paid && (
                                <button
                                  type="button"
                                  onClick={() => printReceipt(order._id)}
                                  className="rounded-full bg-cyan-500 px-3 py-2 text-xs font-bold text-black transition hover:bg-cyan-400"
                                >
                                  Receipt
                                </button>
                              )
                            )}

                            <button
                              type="button"
                              onClick={() => printAll(order._id)}
                              className="rounded-full bg-amber-500 px-3 py-2 text-xs font-bold text-black transition hover:bg-amber-400"
                            >
                              Print
                            </button>

                            {order.paymentUrl &&
                              order.status === "payment_required" && (
                                <a
                                  href={order.paymentUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-full bg-yellow-400 px-3 py-2 text-xs font-bold text-black transition hover:bg-yellow-300"
                                >
                                  Pay Link
                                </a>
                              )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
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