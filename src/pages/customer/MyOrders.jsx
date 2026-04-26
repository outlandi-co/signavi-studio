import { useEffect, useState } from "react"
import api from "../../services/api"

export default function MyOrders() {

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  /* ================= LOAD ORDERS ================= */
  useEffect(() => {

    const loadOrders = async () => {
      try {
        setLoading(true)
        setError("")

        /* 🔥 SAFE USER LOAD */
        let storedUser = null

        try {
          storedUser = JSON.parse(
            localStorage.getItem("customerUser") || "null"
          )
        } catch {
          storedUser = null
        }

        /* 🔥 FALLBACK SUPPORT (old system) */
        let email = storedUser?.email

        if (!email) {
          const fallback = localStorage.getItem("customerEmail")
          if (fallback) {
            email = fallback
          }
        }

        if (!email) {
          setError("No user email found. Please log in again.")
          return
        }

        console.log("📧 Fetching orders for:", email)

        const res = await api.get(`/orders/my-orders?email=${email}`)

        console.log("📦 ORDERS:", res.data)

        setOrders(res.data?.data || [])

      } catch (err) {
        console.error("❌ LOAD ORDERS ERROR:", err)

        if (err.response?.status === 404) {
          setError("Orders route not found (backend not deployed)")
        } else {
          setError("Failed to load orders")
        }

      } finally {
        setLoading(false)
      }
    }

    loadOrders()

  }, [])

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        ⏳ Loading orders...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-400 flex items-center justify-center">
        {error}
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        📦 No orders found
      </div>
    )
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-2xl mb-6">📦 My Orders</h1>

      {orders.map(order => {

        const subtotal = Number(order.subtotal || 0)
        const tax = Number(order.tax || 0)
        const shipping = Number(order.shippingCost || 0)
        const total = Number(order.finalPrice || subtotal + tax + shipping)

        return (
          <div
            key={order._id}
            className="mb-6 p-4 border border-gray-700 rounded bg-[#020617]"
          >

            {/* HEADER */}
            <div className="flex justify-between mb-2">
              <p className="font-bold">Order #{order._id}</p>
              <p className="text-sm text-gray-400">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString()
                  : "—"}
              </p>
            </div>

            {/* STATUS */}
            <p>
              Status:{" "}
              <span className="text-cyan-400 capitalize">
                {order.status || "pending"}
              </span>
            </p>

            {/* ITEMS */}
            <div className="mt-3">
              {(order.items || []).map((item, i) => {
                const price = Number(item.price || 0)
                const qty = Number(item.quantity || 1)

                return (
                  <div key={i} className="text-sm text-gray-300">
                    {item.name} × {qty} — $
                    {(price * qty).toFixed(2)}
                  </div>
                )
              })}
            </div>

            {/* TOTALS */}
            <div className="mt-3 border-t border-gray-700 pt-2 text-sm">
              <p>Subtotal: ${subtotal.toFixed(2)}</p>
              <p>Tax: ${tax.toFixed(2)}</p>
              <p>Shipping: ${shipping.toFixed(2)}</p>

              <h3 className="mt-2 text-lg font-bold">
                Total: ${total.toFixed(2)}
              </h3>
            </div>

            {/* TRACKING */}
            {order.trackingNumber && (
              <div className="mt-3 text-green-400 text-sm">
                Tracking #: {order.trackingNumber}
              </div>
            )}

            {order.trackingLink && (
              <a
                href={order.trackingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline text-sm"
              >
                🔗 Track Package
              </a>
            )}

          </div>
        )
      })}

    </div>
  )
}