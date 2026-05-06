import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

const statusStyles = {
  pending: "text-gray-300",
  payment_required: "text-yellow-400",
  paid: "text-green-400",
  production: "text-purple-400",
  shipping: "text-blue-400",
  shipped: "text-indigo-400",
  delivered: "text-emerald-400",
  denied: "text-red-400",
  archive: "text-gray-400"
}

export default function MyOrders() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        setError("")

        let storedUser = null

        try {
          storedUser = JSON.parse(localStorage.getItem("customerUser") || "null")
        } catch {
          console.warn("⚠️ Failed to parse customerUser")
        }

        let email =
          storedUser?.email ||
          storedUser?.user?.email ||
          storedUser?.data?.email ||
          localStorage.getItem("customerEmail") ||
          ""

        email = email.trim().toLowerCase()

        if (!email) {
          setOrders([])
          setError("Please log in again to view your orders.")
          return
        }

        console.log("📧 USING EMAIL:", email)

        const res = await api.get(
          `/orders/my-orders?email=${encodeURIComponent(email)}`
        )

        console.log("📦 ORDERS:", res.data)

        const data =
          res.data?.data ||
          res.data?.orders ||
          res.data?.myOrders ||
          res.data ||
          []

        setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("❌ LOAD ORDERS ERROR:", err)

        if (err.response?.status === 404) {
          setError("Orders route not found. Check your backend deployment.")
        } else {
          setError("Failed to load orders.")
        }

        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        ⏳ Loading orders...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/customer/dashboard")}
          className="mb-5 text-sm text-blue-400 hover:text-blue-300"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-2xl font-semibold mb-6">📦 My Orders</h1>

        {error && (
          <div className="bg-red-950/40 border border-red-500/40 text-red-300 p-4 rounded mb-4">
            {error}
          </div>
        )}

        {!error && orders.length === 0 && (
          <div className="bg-[#0f172a] border border-white/10 p-5 rounded">
            <p className="text-gray-400">No orders found.</p>
          </div>
        )}

        {!error && orders.length > 0 && (
          <div className="grid gap-4">
            {orders.map((order) => {
              const subtotal = Number(order.subtotal || 0)
              const tax = Number(order.tax || 0)
              const shipping = Number(order.shippingCost || 0)
              const total = Number(
                order.finalPrice || order.total || subtotal + tax + shipping
              )

              const status = order.status || "pending"

              return (
                <div
                  key={order._id}
                  onClick={() => navigate(`/order/${order._id}`)}
                  className="bg-[#0f172a] border border-white/10 rounded-xl p-5 shadow-lg hover:scale-[1.01] transition cursor-pointer"
                >
                  <div className="flex justify-between gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-400">Order ID</p>
                      <p className="font-mono text-xs break-all">
                        {order._id}
                      </p>
                    </div>

                    <p className="text-sm text-gray-400 whitespace-nowrap">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "No date"}
                    </p>
                  </div>

                  <p className="mb-3">
                    Status:{" "}
                    <span
                      className={`capitalize font-semibold ${
                        statusStyles[status] || "text-cyan-400"
                      }`}
                    >
                      {status.replaceAll("_", " ")}
                    </span>
                  </p>

                  <div className="space-y-1">
                    {order.items?.length > 0 ? (
                      order.items.map((item, i) => {
                        const price = Number(item.price || 0)
                        const qty = Number(item.quantity || 1)

                        return (
                          <div key={i} className="text-sm text-gray-300">
                            {item.name || "Item"} × {qty} — $
                            {(price * qty).toFixed(2)}
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-sm text-gray-500">No items listed</p>
                    )}
                  </div>

                  <div className="mt-4 border-t border-white/10 pt-3 text-sm text-gray-300">
                    <p>Subtotal: ${subtotal.toFixed(2)}</p>
                    <p>Tax: ${tax.toFixed(2)}</p>
                    <p>Shipping: ${shipping.toFixed(2)}</p>

                    <h3 className="mt-2 text-lg font-bold text-green-400">
                      Total: ${total.toFixed(2)}
                    </h3>
                  </div>

                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/order/${order._id}`)
                      }}
                      className="text-xs bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
                    >
                      Details
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/track/${order._id}`)
                      }}
                      className="text-xs bg-blue-600 px-3 py-1 rounded hover:bg-blue-500"
                    >
                      Track
                    </button>

                    {order.paymentUrl && status === "payment_required" && (
                      <a
                        href={order.paymentUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-400"
                      >
                        Pay Now
                      </a>
                    )}

                    {order.trackingLink && (
                      <a
                        href={order.trackingLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs bg-emerald-600 px-3 py-1 rounded hover:bg-emerald-500"
                      >
                        Track Package
                      </a>
                    )}
                  </div>

                  {order.trackingNumber && (
                    <p className="mt-3 text-green-400 text-sm">
                      Tracking #: {order.trackingNumber}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}