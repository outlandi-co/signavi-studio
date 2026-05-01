import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState, useCallback } from "react"
import api from "../../services/api"

export default function AdminCustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  /* ================= LOAD ================= */
  const load = useCallback(async () => {
    try {
      setLoading(true)

      // 🔥 get customer
      const customerRes = await api.get(`/customers/${id}`)
      const customerData = customerRes.data?.data || customerRes.data

      setCustomer(customerData)

      // 🔥 get orders by email
      if (customerData?.email) {
        const ordersRes = await api.get(`/orders/my-orders?email=${customerData.email}`)
        setOrders(Array.isArray(ordersRes.data?.data) ? ordersRes.data.data : [])
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
    load()
  }, [load])

  if (loading) return <p className="text-white p-4">Loading...</p>

  if (!customer) {
    return <p className="text-red-400 p-4">Customer not found</p>
  }

  /* ================= CALC ================= */
  const totalSpent = orders.reduce(
    (sum, o) => sum + Number(o.finalPrice || 0),
    0
  )

  return (
    <div className="p-6 text-white">

      <h1 className="text-2xl font-bold mb-6">👤 Customer Detail</h1>

      {/* ================= CUSTOMER INFO ================= */}
      <div className="bg-gray-900 p-4 rounded-lg mb-6">
        <p><b>Email:</b> {customer.email}</p>
        <p><b>Status:</b> {customer.isVIP ? "⭐ VIP" : "Standard"}</p>
        <p><b>Total Orders:</b> {orders.length}</p>
        <p><b>Total Spent:</b> ${totalSpent.toFixed(2)}</p>
      </div>

      {/* ================= ORDERS ================= */}
      <div>
        <h2 className="text-xl mb-3">📦 Orders</h2>

        {orders.length === 0 ? (
          <p className="text-gray-400">No orders found</p>
        ) : (
          <div className="grid gap-3">

            {orders.map(order => (
              <div
                key={order._id}
                onClick={() => navigate(`/admin/order/${order._id}`)}
                className="bg-gray-900 p-4 rounded-lg cursor-pointer hover:bg-gray-800 transition"
              >
                <div className="flex justify-between">
                  <span>#{order._id.slice(-6)}</span>
                  <span>{order.status}</span>
                </div>

                <div className="flex justify-between mt-2 text-sm text-gray-400">
                  <span>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span>${Number(order.finalPrice || 0).toFixed(2)}</span>
                </div>

                <div className="mt-2 text-sm">
                  Margin: {Number(order.margin || 0).toFixed(2)}%
                </div>
              </div>
            ))}

          </div>
        )}
      </div>

    </div>
  )
}