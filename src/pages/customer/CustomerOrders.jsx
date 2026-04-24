import { useEffect, useState } from "react"
import api from "../../services/api"

const statusStyles = {
  pending: "bg-gray-600",
  payment_required: "bg-yellow-500 text-black",
  paid: "bg-green-600",
  production: "bg-purple-600",
  shipping: "bg-blue-500",
  shipped: "bg-indigo-500",
  delivered: "bg-emerald-600",
  denied: "bg-red-600",
  archive: "bg-gray-500"
}

export default function CustomerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await api.get("/orders/my-orders")
        setOrders(res.data?.data || [])
      } catch (err) {
        console.error("❌ LOAD ORDERS ERROR:", err)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  if (loading) {
    return (
      <div className="text-white text-center mt-10">
        Loading orders...
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="text-white text-center mt-10">
        No orders yet
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">
      <h1 className="text-2xl font-semibold mb-6">📦 My Orders</h1>

      <div className="grid gap-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-[#0f172a] border border-white/10 rounded-xl p-5 shadow-lg"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-sm text-gray-400">Order ID</p>
                <p className="font-mono text-xs">{order._id}</p>
              </div>

              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  statusStyles[order.status] || "bg-gray-700"
                }`}
              >
                {order.status}
              </span>
            </div>

            {/* ITEMS */}
            <div className="mb-3">
              {order.items?.map((item, i) => (
                <div key={i} className="text-sm text-gray-300">
                  {item.name} ({item.variant?.color} / {item.variant?.size}) × {item.quantity}
                </div>
              ))}
            </div>

            {/* TOTAL */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>

              <span className="font-semibold text-green-400">
                ${order.finalPrice?.toFixed(2)}
              </span>
            </div>

            {/* ACTION */}
            <div className="mt-3 flex gap-2">
              <a
                href={`/track/${order._id}`}
                className="text-xs bg-blue-600 px-3 py-1 rounded hover:bg-blue-500"
              >
                Track
              </a>

              {order.paymentUrl && order.status === "payment_required" && (
                <a
                  href={order.paymentUrl}
                  className="text-xs bg-yellow-500 text-black px-3 py-1 rounded"
                >
                  Pay Now
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}