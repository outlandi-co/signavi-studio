import { useState } from "react"
import api from "../services/api"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  printing: "bg-blue-100 text-blue-700",
  shipped: "bg-green-100 text-green-700"
}

export default function Card({ order }) {

  const [tracking, setTracking] = useState("")

  const addTracking = async () => {
    await api.patch(`/shipping/${order._id}/tracking`, {
      trackingNumber: tracking
    })
    setTracking("")
  }

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-2xl transition duration-300">

      {/* CUSTOMER */}
      <p className="font-semibold">{order.customerName}</p>

      {/* STATUS */}
      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status]}`}>
        {order.status}
      </span>

      {/* ITEMS */}
      <div className="text-sm mt-2">
        {order.items?.map((item, i) => (
          <p key={i}>{item.name} x{item.quantity}</p>
        ))}
      </div>

      {/* TIMELINE */}
      <div className="mt-2 text-xs text-gray-500">
        {order.timeline?.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>{t.status}</span>
          </div>
        ))}
      </div>

      {/* TRACKING INPUT */}
      {order.status !== "shipped" && (
        <div className="mt-3">
          <input
            value={tracking}
            onChange={e => setTracking(e.target.value)}
            placeholder="Tracking #"
            className="border p-1 w-full text-sm"
          />
          <button
            onClick={addTracking}
            className="bg-black text-white px-3 py-1 mt-2 text-sm rounded"
          >
            Ship
          </button>
        </div>
      )}

    </div>
  )
}