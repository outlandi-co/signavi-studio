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

  useEffect(() => {
    const loadOrders = async () => {
      try {
        /* 🔥 GET EMAIL (ROBUST VERSION) */
        let email = null

        const storedUser = localStorage.getItem("customerUser")
        const fallbackEmail = localStorage.getItem("customerEmail")

        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser)
            email = parsed?.email
          } catch {
            console.warn("⚠️ Failed to parse customerUser")
          }
        }

        if (!email && fallbackEmail) {
          email = fallbackEmail
        }

        if (!email) {
          console.error("❌ NO EMAIL FOUND IN STORAGE")
          setOrders([])
          setLoading(false)
          return
        }

        console.log("📧 USING EMAIL:", email)

        /* 🔥 FIXED CALL */
        const res = await api.get(`/orders/my-orders?email=${email}`)

        console.log("📦 DASHBOARD ORDERS:", res.data)

        const data =
          res.data?.data ||
          res.data?.orders ||
          res.data ||
          []

        setOrders(Array.isArray(data) ? data : [])

      } catch (err) {
        console.error("❌ LOAD ORDERS ERROR:", err)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">
      <h1 className="text-2xl font-semibold mb-6">👤 Dashboard</h1>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => navigate("/my-orders")}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 transition"
        >
          📦 View All Orders
        </button>
      </div>

      {loading && (
        <p className="text-gray-400">Loading your orders...</p>
      )}

      {!loading && orders.length === 0 && (
        <p className="text-gray-400">
          No orders yet
        </p>
      )}

      {!loading && orders.length > 0 && (
        <div className="grid gap-4">
          {orders.slice(0, 5).map((order) => (
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
                    statusStyles[order.status] || "bg-gray-700"
                  }`}
                >
                  {(order.status || "unknown").replace("_", " ")}
                </span>
              </div>

              <div className="text-sm text-gray-300">
                {order.items?.length || 0} item(s)
              </div>

              <div className="text-green-400 font-semibold mt-1">
                ${Number(order.finalPrice || 0).toFixed(2)}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/track/${order._id}`)
                }}
                className="mt-2 text-xs bg-blue-600 px-3 py-1 rounded hover:bg-blue-500"
              >
                Track
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}