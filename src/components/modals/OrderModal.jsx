import api from "../../services/api"
import toast from "react-hot-toast"

export default function OrderModal({ order, onClose, onUpdated }) {

  const updateStatus = async (status) => {
    try {
      const res = await api.patch(`/orders/${order._id}/status`, { status })

      toast.success("Order updated")
      onUpdated(res.data)
      onClose()

    } catch (err) {
      console.error(err)
      toast.error("Failed to update")
    }
  }

  /* 💳 SQUARE PAYMENT */
  const handlePayment = async () => {
    try {
      const res = await api.post(`/square/create-payment/${order._id}`)

      if (!res?.data?.url) {
        throw new Error("No payment URL")
      }

      window.location.href = res.data.url

    } catch (err) {
      console.error(err)
      toast.error("Payment failed")
    }
  }

  if (!order) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-lg">

        <h2 className="text-xl mb-4">📦 Order Detail</h2>

        <p><strong>ID:</strong> {order._id}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Customer:</strong> {order.customerName}</p>
        <p><strong>Email:</strong> {order.email}</p>
        <p><strong>Qty:</strong> {order.quantity}</p>
        <p><strong>Price:</strong> ${order.finalPrice || order.price}</p>

        <div className="flex flex-wrap gap-2 mt-6">

          <button onClick={() => updateStatus("production")} className="bg-blue-600 px-3 py-2 rounded">
            Send to Production
          </button>

          <button onClick={() => updateStatus("completed")} className="bg-green-600 px-3 py-2 rounded">
            Complete
          </button>

          <button onClick={handlePayment} className="bg-purple-600 px-3 py-2 rounded">
            💳 Pay Now
          </button>

          <button onClick={onClose} className="bg-gray-700 px-3 py-2 rounded">
            Close
          </button>

        </div>
      </div>
    </div>
  )
}