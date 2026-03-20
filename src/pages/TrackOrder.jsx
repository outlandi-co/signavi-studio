import { useState } from "react"
import api from "../services/api"

function TrackOrder() {

  const [orderId, setOrderId] = useState("")
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    try {
      setLoading(true)
      setError("")
      setOrder(null)

      const res = await api.get(`/orders/track/${orderId}`)

      setOrder(res.data)

    } catch (err) {
      console.error(err)
      setError("Order not found")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6">

      <h2 className="text-2xl font-semibold">Track Your Order</h2>

      {/* INPUT */}
      <div className="flex gap-2">
        <input
          className="p-2 border rounded"
          placeholder="Enter Order ID (SNV-...)"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />

        <button
          className="btn btn-primary"
          onClick={handleSearch}
        >
          Track
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* RESULT */}
      {order && (
        <div className="card w-[350px] flex flex-col gap-3">

          <h3 className="text-lg font-semibold">
            {order.orderId}
          </h3>

          <p>Status: <strong>{order.status}</strong></p>

          {/* STATUS BAR */}
          <div className="flex justify-between text-xs">
            <span>Paid</span>
            <span>Printing</span>
            <span>Completed</span>
            <span>Shipped</span>
            <span>Delivered</span>
          </div>

          <div className="h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-purple-500 rounded"
              style={{
                width:
                  order.status === "paid" ? "20%" :
                  order.status === "printing" ? "40%" :
                  order.status === "completed" ? "60%" :
                  order.status === "shipped" ? "80%" :
                  "100%"
              }}
            />
          </div>

          {/* SHIPPING */}
          {order.shipping?.trackingNumber && (
            <div className="mt-2 text-sm">
              <p>Carrier: {order.shipping.carrier}</p>
              <p>Tracking: {order.shipping.trackingNumber}</p>
            </div>
          )}

        </div>
      )}

    </div>
  )
}

export default TrackOrder