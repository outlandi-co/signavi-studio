import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../../services/api"

export default function AdminOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/orders/${id}`)
        setOrder(res.data?.data || null)
      } catch (err) {
        console.error("❌ ORDER DETAIL ERROR:", err)
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [id])

  if (loading) {
    return <p className="text-white p-4">Loading order...</p>
  }

  if (!order) {
    return <p className="text-red-400 p-4">Order not found</p>
  }

  const address = order.address || {}

  return (
    <div className="p-6 text-white">
      <button
        onClick={() => navigate("/admin/orders")}
        className="mb-4 bg-gray-700 px-4 py-2 rounded"
      >
        ← Back to Orders
      </button>

      <h1 className="text-2xl font-bold mb-6">
        📦 Order #{order._id.slice(-6)}
      </h1>

      <div className="bg-gray-900 p-4 rounded-lg mb-6 space-y-2">
        <p><b>Name:</b> {order.customerName || "Customer"}</p>
        <p><b>Email:</b> {order.email || "Not provided"}</p>
        <p><b>Phone:</b> {order.phone || "Not provided"}</p>
        <p><b>Status:</b> {order.status}</p>
        <p><b>Total:</b> ${Number(order.finalPrice || 0).toFixed(2)}</p>
        <p><b>Subtotal:</b> ${Number(order.subtotal || 0).toFixed(2)}</p>
        <p><b>Tax:</b> ${Number(order.tax || 0).toFixed(2)}</p>
        <p><b>Profit:</b> ${Number(order.profit || 0).toFixed(2)}</p>
        <p><b>Margin:</b> {Number(order.margin || 0).toFixed(2)}%</p>
      </div>

      <div className="bg-gray-900 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-3">Shipping Address</h2>

        {address.street ? (
          <>
            <p>{address.street}</p>
            <p>
              {address.city}, {address.state} {address.zip}
            </p>
            <p>{address.country || "US"}</p>
          </>
        ) : (
          <p className="text-gray-400">No address provided</p>
        )}
      </div>

      <div className="bg-gray-900 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-3">Items</h2>

        {order.items?.length ? (
          <div className="grid gap-3">
            {order.items.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="border border-gray-800 rounded p-3"
              >
                <p><b>{item.name}</b></p>
                <p>Qty: {item.quantity}</p>
                <p>Price: ${Number(item.price || 0).toFixed(2)}</p>
                <p>
                  Variant: {item.variant?.color || "-"} / {item.variant?.size || "-"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No items found</p>
        )}
      </div>
    </div>
  )
}