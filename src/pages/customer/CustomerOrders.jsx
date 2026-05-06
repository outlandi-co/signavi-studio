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
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        setError("")

        let email = ""

        const storedUser = localStorage.getItem("customerUser")
        const fallbackEmail = localStorage.getItem("customerEmail")

        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            email = parsedUser?.email || ""
          } catch {
            console.warn("⚠️ Failed to parse customerUser")
          }
        }

        if (!email && fallbackEmail) {
          email = fallbackEmail
        }

        email = email.trim().toLowerCase()

        if (!email) {
          setOrders([])
          setError("Please log in again to view your orders.")
          return
        }

        console.log("📧 FETCHING ORDERS FOR:", email)

        const res = await api.get(
          `/orders/my-orders?email=${encodeURIComponent(email)}`
        )

        console.log("📦 ORDERS RESPONSE:", res.data)

        const data =
          res.data?.data ||
          res.data?.orders ||
          res.data?.myOrders ||
          res.data ||
          []

        setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("❌ LOAD ORDERS ERROR:", err.response?.data || err.message)
        setOrders([])
        setError("Could not load your orders right now.")
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        Loading orders...
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

        <h1 className="text-2xl font-semibold mb-2">📦 My Orders</h1>

        <p className="text-gray-400 mb-6">
          View your order history, payment status, and tracking updates.
        </p>

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
              const status = order.status || "unknown"

              const total = Number(
                order.finalPrice || order.total || order.subtotal || 0
              )

              return (
                <div
                  key={order._id}
                  className="bg-[#0f172a] border border-white/10 rounded-xl p-5 shadow-lg hover:scale-[1.01] transition cursor-pointer"
                  onClick={() => navigate(`/order/${order._id}`)}
                >
                  <div className="flex justify-between items-center mb-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Order ID</p>
                      <p className="font-mono text-xs break-all">
                        {order._id}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                        statusStyles[status] || "bg-gray-700"
                      }`}
                    >
                      {status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="mb-3 space-y-1">
                    {order.items?.length > 0 ? (
                      order.items.map((item, i) => (
                        <div key={i} className="text-sm text-gray-300">
                          {item.name || "Item"} (
                          {item.variant?.color ||
                            item.selectedVariant?.color ||
                            "-"}{" "}
                          /{" "}
                          {item.variant?.size ||
                            item.selectedVariant?.size ||
                            "-"}
                          ) × {item.quantity || 1}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No items listed</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "No date"}
                    </span>

                    <span className="font-semibold text-green-400">
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-3 flex gap-2 flex-wrap">
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
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}