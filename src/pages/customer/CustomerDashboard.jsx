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

export default function CustomerDashboard() {
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
            console.warn("⚠️ Could not parse customerUser from localStorage")
          }
        }

        if (!email && fallbackEmail) {
          email = fallbackEmail
        }

        email = email.trim().toLowerCase()

        if (!email) {
          console.error("❌ No customer email found")
          setOrders([])
          setError("Please log in again to view your orders.")
          return
        }

        console.log("📧 CUSTOMER DASHBOARD EMAIL:", email)

        const res = await api.get(
          `/orders/my-orders?email=${encodeURIComponent(email)}`
        )

        console.log("📦 CUSTOMER DASHBOARD RESPONSE:", res.data)

        const orderData =
          res.data?.data ||
          res.data?.orders ||
          res.data?.myOrders ||
          res.data ||
          []

        setOrders(Array.isArray(orderData) ? orderData : [])
      } catch (err) {
        console.error("❌ Customer dashboard load error:", err)
        setOrders([])
        setError("Could not load your orders right now.")
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">👤 Customer Dashboard</h1>

        <p className="text-gray-400 mb-6">
          View your recent orders, payment status, and tracking updates.
        </p>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => navigate("/my-orders")}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 transition"
          >
            📦 View All Orders
          </button>

          <button
            onClick={() => navigate("/store")}
            className="bg-emerald-600 px-4 py-2 rounded hover:bg-emerald-500 transition"
          >
            🛒 Continue Shopping
          </button>
        </div>

        {loading && <p className="text-gray-400">Loading your orders...</p>}

        {!loading && error && (
          <div className="bg-red-950/40 border border-red-500/40 text-red-300 p-4 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="bg-[#0f172a] border border-white/10 p-5 rounded">
            <p className="text-gray-400">No orders yet.</p>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="grid gap-4">
            {orders.slice(0, 5).map((order) => {
              const status = order.status || "unknown"
              const total = Number(
                order.finalPrice || order.total || order.subtotal || 0
              )

              return (
                <div
                  key={order._id}
                  onClick={() => navigate(`/order/${order._id}`)}
                  className="bg-[#0f172a] border border-white/10 p-4 rounded cursor-pointer hover:scale-[1.01] transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "No date"}
                    </span>

                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        statusStyles[status] || "bg-gray-700"
                      }`}
                    >
                      {status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="text-sm text-gray-300">
                    {order.items?.length || 0} item(s)
                  </div>

                  <div className="text-green-400 font-semibold mt-1">
                    ${total.toFixed(2)}
                  </div>

                  <div className="flex gap-2 mt-3">
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