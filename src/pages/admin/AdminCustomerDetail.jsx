import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../../services/api"

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

export default function AdminCustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)

      const customerRes = await api.get(`/customers/${id}`)
      const customerData = customerRes.data?.data || customerRes.data

      setCustomer(customerData)
      setNotes(customerData?.notes || "")

      if (customerData?.email) {
        const encodedEmail = encodeURIComponent(customerData.email)

        const ordersRes = await api.get(
          `/orders/my-orders?email=${encodedEmail}`
        )

        const orderData =
          ordersRes.data?.data ||
          ordersRes.data?.orders ||
          ordersRes.data?.myOrders ||
          ordersRes.data ||
          []

        setOrders(Array.isArray(orderData) ? orderData : [])
      } else {
        setOrders([])
      }
    } catch (err) {
      console.error("❌ CUSTOMER DETAIL ERROR:", err)
      setCustomer(null)
      setOrders([])
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

  const saveCustomer = async (updates) => {
    try {
      setSaving(true)

      const res = await api.patch(`/customers/${id}`, updates)
      const updated = res.data?.data || res.data

      setCustomer(updated)
      setNotes(updated?.notes || "")
    } catch (err) {
      console.error("❌ SAVE CUSTOMER ERROR:", err.response?.data || err)
      alert("Could not save customer.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] p-6 text-white">
        Loading customer...
      </main>
    )
  }

  if (!customer) {
    return (
      <main className="min-h-screen bg-[#020617] p-6 text-red-400">
        Customer not found.
      </main>
    )
  }

  const totalSpent = orders.reduce((sum, order) => {
    return sum + Number(order.finalPrice || order.total || order.subtotal || 0)
  }, 0)

  const totalProfit = orders.reduce((sum, order) => {
    return sum + Number(order.profit || 0)
  }, 0)

  const averageOrder = orders.length > 0 ? totalSpent / orders.length : 0

  const largestOrder = orders.reduce((max, order) => {
    const total = Number(order.finalPrice || order.total || order.subtotal || 0)
    return total > max ? total : max
  }, 0)

  const latestOrder = orders[0] || null

  const customerName =
    customer.customerName ||
    customer.name ||
    latestOrder?.customerName ||
    "Customer"

  const phone =
    customer.phone ||
    latestOrder?.phone ||
    "Not provided"

  const address = latestOrder?.address || customer.address || {}

  const hasAddress =
    address?.street ||
    address?.city ||
    address?.state ||
    address?.zip

  const formattedAddress = hasAddress
    ? `${address.street || ""}${address.city ? `, ${address.city}` : ""}${
        address.state ? `, ${address.state}` : ""
      }${address.zip ? ` ${address.zip}` : ""}${
        address.country ? `, ${address.country}` : ""
      }`
    : "Not provided"

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <section className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate("/admin/customers")}
          className="mb-8 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
        >
          ← Back to Customers
        </button>

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              Customer Profile
            </p>

            <h1 className="text-4xl font-extrabold md:text-5xl">
              {customerName}
            </h1>

            <p className="mt-3 text-slate-400">
              {customer.email || "No email provided"}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              saveCustomer({
                isVIP: !customer.isVIP
              })
            }
            disabled={saving}
            className={
              customer.isVIP
                ? "rounded-full bg-yellow-400 px-5 py-3 font-bold text-black transition hover:bg-yellow-300 disabled:opacity-60"
                : "rounded-full border border-slate-700 px-5 py-3 font-bold text-white transition hover:border-yellow-400 hover:text-yellow-300 disabled:opacity-60"
            }
          >
            {customer.isVIP ? "⭐ VIP Customer" : "Mark As VIP"}
          </button>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Orders"
            value={orders.length}
            accent="text-cyan-300"
          />

          <MetricCard
            label="Total Spent"
            value={money(totalSpent)}
            accent="text-emerald-300"
          />

          <MetricCard
            label="Average Order"
            value={money(averageOrder)}
            accent="text-blue-300"
          />

          <MetricCard
            label="Largest Order"
            value={money(largestOrder)}
            accent="text-purple-300"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
              <h2 className="mb-5 text-2xl font-bold">
                Customer Information
              </h2>

              <div className="grid gap-4">
                <Info label="Name" value={customerName} />
                <Info label="Email" value={customer.email || "Not provided"} />
                <Info label="Phone" value={phone} />
                <Info label="Address" value={formattedAddress} />
                <Info
                  label="Status"
                  value={customer.isVIP ? "VIP Customer" : "Standard Customer"}
                />
                <Info
                  label="Created"
                  value={
                    customer.createdAt
                      ? new Date(customer.createdAt).toLocaleDateString()
                      : "Not available"
                  }
                />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
              <h2 className="mb-5 text-2xl font-bold">
                Quick Actions
              </h2>

              <div className="grid gap-3">
                {customer.email && (
                  <a
                    href={`mailto:${customer.email}`}
                    className="rounded-xl border border-slate-700 px-4 py-3 text-center font-bold text-white transition hover:border-cyan-400 hover:text-cyan-300"
                  >
                    Email Customer
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => navigate("/admin/orders")}
                  className="rounded-xl border border-slate-700 px-4 py-3 font-bold text-white transition hover:border-cyan-400 hover:text-cyan-300"
                >
                  View All Orders
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/admin/invoices")}
                  className="rounded-xl border border-slate-700 px-4 py-3 font-bold text-white transition hover:border-cyan-400 hover:text-cyan-300"
                >
                  View Invoices
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/admin/support")}
                  className="rounded-xl border border-slate-700 px-4 py-3 font-bold text-white transition hover:border-cyan-400 hover:text-cyan-300"
                >
                  Support History
                </button>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
              <h2 className="mb-5 text-2xl font-bold">
                Customer Notes
              </h2>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add customer notes..."
                className="min-h-[160px] w-full rounded-2xl border border-slate-700 bg-[#020617] p-4 text-white outline-none transition focus:border-cyan-400"
              />

              <button
                type="button"
                onClick={() =>
                  saveCustomer({
                    notes
                  })
                }
                disabled={saving}
                className="mt-4 w-full rounded-xl bg-cyan-500 px-4 py-3 font-bold text-black transition hover:bg-cyan-400 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Notes"}
              </button>
            </section>
          </div>

          <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  Order History
                </h2>

                <p className="text-sm text-slate-500">
                  Orders connected to this customer profile.
                </p>
              </div>

              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-300">
                {orders.length} Orders
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-[#020617] p-8 text-center text-slate-400">
                No orders found.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-800">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[780px] text-left">
                    <thead className="bg-[#020617] text-sm text-slate-400">
                      <tr>
                        <th className="p-4">Order</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Total</th>
                        <th className="p-4">Profit</th>
                        <th className="p-4">Margin</th>
                        <th className="p-4">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => {
                        const total = Number(
                          order.finalPrice ||
                            order.total ||
                            order.subtotal ||
                            0
                        )

                        return (
                          <tr
                            key={order._id}
                            className="border-t border-slate-800 text-sm"
                          >
                            <td className="p-4 font-mono font-bold text-cyan-300">
                              #{String(order._id || "").slice(-6).toUpperCase()}
                            </td>

                            <td className="p-4 text-slate-400">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString()
                                : "No date"}
                            </td>

                            <td className="p-4">
                              {formatStatus(order.status)}
                            </td>

                            <td className="p-4 font-bold text-emerald-300">
                              {money(total)}
                            </td>

                            <td className="p-4">
                              {money(order.profit)}
                            </td>

                            <td className="p-4">
                              {Number(order.margin || 0).toFixed(2)}%
                            </td>

                            <td className="p-4">
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/admin/order/${order._id}`)
                                }
                                className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-bold text-black transition hover:bg-cyan-400"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Info label="Lifetime Value" value={money(totalSpent)} />
              <Info label="Total Profit" value={money(totalProfit)} />
              <Info label="Average Order" value={money(averageOrder)} />
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}

function MetricCard({ label, value, accent }) {
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