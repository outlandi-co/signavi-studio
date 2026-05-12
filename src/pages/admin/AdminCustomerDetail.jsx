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

      const customerRes = await api.get(`/customers/${id}`)
      const customerData = customerRes.data?.data || customerRes.data

      setCustomer(customerData)

      if (customerData?.email) {
        const encodedEmail = encodeURIComponent(customerData.email)

        const ordersRes = await api.get(
          `/orders/my-orders?email=${encodedEmail}`
        )

        const orderData = Array.isArray(ordersRes.data?.data)
          ? ordersRes.data.data
          : []

        setOrders(orderData)
      } else {
        setOrders([])
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
    const timer = setTimeout(() => {
      load()
    }, 0)

    return () => clearTimeout(timer)
  }, [load])

  if (loading) {
    return <p className="text-white p-4">Loading...</p>
  }

  if (!customer) {
    return <p className="text-red-400 p-4">Customer not found</p>
  }

  /* ================= CALC ================= */

  const totalSpent = orders.reduce(
    (sum, order) => sum + Number(order.finalPrice || 0),
    0
  )

  const latestOrder = orders[0] || null

  const customerName =
    customer.customerName ||
    customer.name ||
    latestOrder?.customerName ||
    "Customer"

  const phone =
    customer.phone ||
    latestOrder?.phone ||
    "Not provided"

  const address = latestOrder?.address || customer.address || {}

  const hasAddress =
    address?.street ||
    address?.city ||
    address?.state ||
    address?.zip

  const formattedAddress = hasAddress
    ? `${address.street || ""}${address.city ? `, ${address.city}` : ""}${address.state ? `, ${address.state}` : ""}${address.zip ? ` ${address.zip}` : ""}${address.country ? `, ${address.country}` : ""}`
    : "Not provided"

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">
        👤 Customer Detail
      </h1>

      {/* ================= CUSTOMER INFO ================= */}
      <div className="bg-gray-900 p-4 rounded-lg mb-6 space-y-2">
        <p>
          <b>Name:</b> {customerName}
        </p>

        <p>
          <b>Email:</b> {customer.email}
        </p>

        <p>
          <b>Phone:</b> {phone}
        </p>

        <p>
          <b>Address:</b> {formattedAddress}
        </p>

        <p>
          <b>Status:</b> {customer.isVIP ? "⭐ VIP" : "Standard"}
        </p>

        <p>
          <b>Total Orders:</b> {orders.length}
        </p>

        <p>
          <b>Total Spent:</b> ${totalSpent.toFixed(2)}
        </p>
      </div>

      {/* ================= ORDERS ================= */}
      <div>
        <h2 className="text-xl mb-3">
          📦 Orders
        </h2>

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

                  <span>
                    ${Number(order.finalPrice || 0).toFixed(2)}
                  </span>
                </div>

                <div className="mt-2 text-sm">
                  Margin: {Number(order.margin || 0).toFixed(2)}%
                </div>

                {order.phone && (
                  <div className="mt-2 text-xs text-gray-400">
                    Phone: {order.phone}
                  </div>
                )}

                {order.address?.street && (
                  <div className="mt-1 text-xs text-gray-400">
                    Ship To:{" "}
                    {order.address.street}
                    {order.address.city ? `, ${order.address.city}` : ""}
                    {order.address.state ? `, ${order.address.state}` : ""}
                    {order.address.zip ? ` ${order.address.zip}` : ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}