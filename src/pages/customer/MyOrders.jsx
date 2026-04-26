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

        /* 🔥 FIX: get email correctly */
        const storedUser = JSON.parse(
          localStorage.getItem("customerUser") || "null"
        )

        if (!storedUser?.email) {
          setError("No user email found. Please log in.")
          setLoading(false)
          return
        }

        console.log("📧 Fetching orders for:", storedUser.email)

        const res = await api.get(
          `/orders/my-orders?email=${storedUser.email}`
        )

        console.log("📦 ORDERS:", res.data)

        setOrders(res.data?.data || [])

      } catch (err) {
        console.error("❌ LOAD ORDERS ERROR:", err)

        if (err.response?.status === 404) {
          setError("Orders route not found (backend not deployed yet)")
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
        Loading orders...
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
        No orders found
      </div>
    )
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-2xl mb-6">📦 My Orders</h1>

      {orders.map(order => (

        <div
          key={order._id}
          className="mb-6 p-4 border border-gray-700 rounded bg-[#020617]"
        >

          <div className="flex justify-between mb-2">
            <p className="font-bold">Order #{order._id}</p>
            <p className="text-sm text-gray-400">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          <p>Status: <span className="text-cyan-400">{order.status}</span></p>

          <div className="mt-3">
            {order.items.map((item, i) => (
              <div key={i} className="text-sm text-gray-300">
                {item.name} × {item.quantity} — $
                {(item.price * item.quantity).toFixed(2)}
              </div>
            ))}
          </div>

          <div className="mt-3 border-t border-gray-700 pt-2">
            <p>Subtotal: ${order.subtotal?.toFixed(2)}</p>
            <p>Tax: ${order.tax?.toFixed(2)}</p>
            <p>Shipping: ${order.shippingCost?.toFixed(2) || "0.00"}</p>

            <h3 className="mt-2 text-lg font-bold">
              Total: ${order.finalPrice?.toFixed(2)}
            </h3>
          </div>

          {/* 🔥 TRACKING */}
          {order.trackingNumber && (
            <div className="mt-3 text-green-400">
              Tracking: {order.trackingNumber}
            </div>
          )}

          {order.trackingLink && (
            <a
              href={order.trackingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              Track Package
            </a>
          )}

        </div>

      ))}

    </div>
  )
}