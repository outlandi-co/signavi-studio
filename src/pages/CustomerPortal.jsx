import { useState } from "react"
import api from "../services/api"
import Timeline from "../components/Timeline"

export default function CustomerPortal() {

  const [orderId, setOrderId] = useState("")
  const [email, setEmail] = useState("")
  const [order, setOrder] = useState(null)
  const [error, setError] = useState("")

  const lookup = async () => {
    try {
      setError("")

      const res = await api.post("/public/lookup", {
        orderId,
        email
      })

      setOrder(res.data.data)

    } catch (err) {
      console.error(err)
      setError("Order not found")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">

      <div className="bg-white p-6 rounded-xl shadow w-full max-w-md">

        <h1 className="text-xl font-bold mb-4">
          📦 Track Your Order
        </h1>

        {!order ? (
          <>
            <input
              placeholder="Order ID"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              className="border p-2 w-full mb-2"
            />

            <input
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border p-2 w-full mb-3"
            />

            <button
              onClick={lookup}
              className="bg-black text-white w-full py-2 rounded"
            >
              Lookup Order
            </button>

            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </>
        ) : (
          <div>

            <h2 className="font-semibold">
              {order.customerName}
            </h2>

            <p className="text-sm text-gray-500">
              Order #{order._id.slice(-6)}
            </p>

            <p className="mt-2 font-bold text-green-600">
              ${order.finalPrice || order.price}
            </p>

            <p className="mt-2">
              Status: {order.status}
            </p>

            {order.trackingNumber && (
              <p className="text-sm mt-1">
                🚚 Tracking: {order.trackingNumber}
              </p>
            )}

            {/* 🔥 TIMELINE */}
            <Timeline timeline={order.timeline} />

          </div>
        )}

      </div>

    </div>
  )
}