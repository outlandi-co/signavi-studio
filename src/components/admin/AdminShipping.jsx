import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

const carrierOptions = [
  "USPS",
  "UPS",
  "FedEx",
  "DHL",
  "Other"
]

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

export default function AdminShipping() {
  const navigate = useNavigate()

  const [orderId, setOrderId] = useState("")
  const [order, setOrder] = useState(null)

  const [trackingNumber, setTrackingNumber] = useState("")
  const [trackingLink, setTrackingLink] = useState("")
  const [carrier, setCarrier] = useState("USPS")

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadOrder = async () => {
    if (!orderId.trim()) {
      alert("Enter an order ID")
      return
    }

    try {
      setLoading(true)

      const res = await api.get(`/orders/${orderId.trim()}`)
      const data = res.data?.data || res.data || null

      if (!data?._id) {
        throw new Error("Order not found")
      }

      setOrder(data)
      setTrackingNumber(data.trackingNumber || "")
      setTrackingLink(data.trackingLink || "")
      setCarrier(data.carrier || "USPS")
    } catch (err) {
      console.error("❌ LOAD SHIPPING ORDER ERROR:", err)
      alert("Order not found")
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const updateShipping = async () => {
    if (!order?._id) {
      alert("Load an order first")
      return
    }

    if (!trackingNumber.trim()) {
      alert("Tracking number is required")
      return
    }

    try {
      setSaving(true)

      const payload = {
        trackingNumber: trackingNumber.trim(),
        trackingLink: trackingLink.trim(),
        carrier,
        status: "shipped"
      }

      let updated = null

      try {
        const res = await api.patch(
          `/orders/update-shipping/${order._id}`,
          payload
        )

        updated = res.data?.data || res.data?.order || res.data || null
      } catch (shippingErr) {
        console.warn(
          "⚠️ update-shipping route failed, trying general order patch:",
          shippingErr.response?.data || shippingErr.message
        )

        const res = await api.patch(`/orders/${order._id}`, payload)

        updated = res.data?.data || res.data?.order || res.data || null
      }

      if (updated?._id) {
        setOrder(updated)
      }

      alert("✅ Shipping updated and order marked as shipped")
      await loadOrder()
    } catch (err) {
      console.error("❌ UPDATE SHIPPING ERROR:", err.response?.data || err)
      alert(err.response?.data?.message || "Error updating shipping")
    } finally {
      setSaving(false)
    }
  }

  const openOrderDetail = () => {
    if (!order?._id) return

    navigate(`/admin/order/${order._id}`)
  }

  const total = Number(
    order?.finalPrice ||
      order?.total ||
      order?.subtotal ||
      0
  )

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            Shipping Panel
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Search an order, add carrier details, enter tracking, and mark the
            order as shipped.
          </p>
        </div>

        <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
          <h2 className="mb-5 text-2xl font-bold">
            Find Order
          </h2>

          <div className="grid gap-4 md:grid-cols-[1fr_160px]">
            <input
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  loadOrder()
                }
              }}
              placeholder="Enter full order ID"
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <button
              type="button"
              onClick={loadOrder}
              disabled={loading}
              className="rounded-2xl bg-cyan-500 px-5 py-4 font-bold text-black transition hover:bg-cyan-400 disabled:opacity-60"
            >
              {loading ? "Loading..." : "Load Order"}
            </button>
          </div>
        </section>

        {order && (
          <div className="grid gap-6 xl:grid-cols-[1fr_.8fr]">
            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
              <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
                    Order
                  </p>

                  <h2 className="mt-2 text-3xl font-extrabold">
                    #{String(order._id || "").slice(-6).toUpperCase()}
                  </h2>

                  <p className="mt-2 text-slate-400">
                    {order.customerName || "Unknown Customer"}
                  </p>

                  <p className="text-slate-500">
                    {order.email || "No email"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openOrderDetail}
                  className="rounded-full border border-cyan-400/40 px-5 py-3 font-bold text-cyan-300 transition hover:bg-cyan-400/10"
                >
                  View Order
                </button>
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-3">
                <Info label="Status" value={formatStatus(order.status)} />
                <Info label="Total" value={money(total)} />
                <Info
                  label="Priority"
                  value={formatStatus(order.priority || "medium")}
                />
              </div>

              <h3 className="mb-4 text-xl font-bold">
                Items
              </h3>

              {order.items?.length ? (
                <div className="grid gap-3">
                  {order.items.map((item, index) => (
                    <div
                      key={`${item.name || "item"}-${index}`}
                      className="rounded-2xl border border-slate-800 bg-[#020617] p-4"
                    >
                      <p className="font-bold">
                        {item.name || "Item"}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        {item.variant?.color ||
                          item.selectedVariant?.color ||
                          "-"}{" "}
                        /{" "}
                        {item.variant?.size ||
                          item.selectedVariant?.size ||
                          "-"}
                      </p>

                      <p className="mt-2 text-sm text-cyan-300">
                        Qty: {item.quantity || 1}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">
                  No items found.
                </p>
              )}
            </section>

            <aside className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
              <h2 className="mb-5 text-2xl font-bold">
                Shipping Info
              </h2>

              <label className="mb-2 block text-sm font-bold text-slate-300">
                Carrier
              </label>

              <select
                value={carrier}
                onChange={(event) => setCarrier(event.target.value)}
                className="mb-4 w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white"
              >
                {carrierOptions.map((option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ))}
              </select>

              <label className="mb-2 block text-sm font-bold text-slate-300">
                Tracking Number
              </label>

              <input
                value={trackingNumber}
                onChange={(event) => setTrackingNumber(event.target.value)}
                placeholder="Tracking Number"
                className="mb-4 w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white"
              />

              <label className="mb-2 block text-sm font-bold text-slate-300">
                Tracking Link
              </label>

              <input
                value={trackingLink}
                onChange={(event) => setTrackingLink(event.target.value)}
                placeholder="https://..."
                className="mb-4 w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white"
              />

              {trackingLink && (
                <a
                  href={trackingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mb-4 inline-flex text-sm font-bold text-cyan-300 hover:text-cyan-200"
                >
                  Open tracking link →
                </a>
              )}

              <button
                type="button"
                onClick={updateShipping}
                disabled={saving}
                className="mt-2 w-full rounded-xl bg-emerald-500 px-4 py-3 font-bold text-black transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {saving ? "Updating..." : "Mark As Shipped"}
              </button>

              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                This updates tracking information and moves the order status to
                shipped.
              </p>
            </aside>
          </div>
        )}
      </section>
    </main>
  )
}

function Info({
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