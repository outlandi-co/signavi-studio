import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
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

  const navigate = useNavigate()

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const email = localStorage.getItem("customerEmail")

        if (!email) {
          console.error("❌ No email found in localStorage")
          setOrders([])
          return
        }

        const res = await api.get(`/orders/my-orders?email=${email}`)

        console.log("📦 ORDERS RESPONSE:", res.data)

        const data =
          res.data?.data ||
          res.data?.orders ||
          res.data ||
          []

        setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("❌ LOAD ORDERS ERROR:", err.response?.data || err.message)
        setOrders([])
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
        No orders found
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
            className="bg-[#0f172a] border border-white/10 rounded-xl p-5 shadow-lg hover:scale-[1.01] transition cursor-pointer"
            onClick={() => navigate(`/order/${order._id}`)}
          >
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-sm text-gray-400">Order ID</p>
                <p className="font-mono text-xs break-all">{order._id}</p>
              </div>

              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  statusStyles[order.status] || "bg-gray-700"
                }`}
              >
                {(order.status || "unknown").replace("_", " ")}
              </span>
            </div>

            <div className="mb-3">
              {order.items?.map((item, i) => (
                <div key={i} className="text-sm text-gray-300">
                  {item.name} ({item.variant?.color} / {item.variant?.size}) × {item.quantity}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>

              <span className="font-semibold text-green-400">
                ${Number(order.finalPrice || 0).toFixed(2)}
              </span>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/track/${order._id}`)
                }}
                className="text-xs bg-blue-600 px-3 py-1 rounded"
              >
                Track
              </button>

              {order.paymentUrl && order.status === "payment_required" && (
                <a
                  href={order.paymentUrl}
                  onClick={(e) => e.stopPropagation()}
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