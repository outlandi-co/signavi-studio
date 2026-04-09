import { useState } from "react"
import api from "../services/api"
import Timeline from "./Timeline"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  printing: "bg-blue-100 text-blue-700",
  shipped: "bg-green-100 text-green-700",
  approved: "bg-green-100 text-green-700",
  denied: "bg-red-100 text-red-700"
}

export default function Card({ order, job, onDelete }) {

  const data = order || job

  const [tracking, setTracking] = useState("")
  const [deleting, setDeleting] = useState(false)

  /* ================= ADD TRACKING ================= */
  const addTracking = async () => {
    if (!tracking) return

    try {
      await api.patch(`/shipping/${data._id}/tracking`, {
        trackingNumber: tracking
      })

      setTracking("")
    } catch (err) {
      console.error("❌ TRACKING ERROR:", err)
    }
  }

  /* ================= DELETE (🔥 UNIVERSAL) ================= */
  const handleDelete = async () => {
    if (!window.confirm("Delete this item?")) return

    try {
      setDeleting(true)

      await api.delete(`/job/${data._id}`)

      // 🔥 instant UI removal
      onDelete?.(data._id)

    } catch (err) {
      console.error("❌ DELETE ERROR:", err.response?.data || err.message)
      alert("Delete failed")
    } finally {
      setDeleting(false)
    }
  }

  /* ================= PRICE ================= */
  const itemsTotal = data.items?.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  ) || 0

  const final = data.finalPrice || itemsTotal
  const shipping = data.shippingCost || 0

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-2xl transition duration-300 relative">

      {/* DELETE BUTTON 🔥 */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="absolute top-2 right-2 text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:opacity-50"
      >
        {deleting ? "..." : "Delete"}
      </button>

      {/* CUSTOMER */}
      <p className="font-semibold">{data.customerName}</p>

      {/* TYPE */}
      <p className="text-[10px] opacity-60">
        {data.type === "quote" ? "📝 Quote Request" : "📦 Order"}
      </p>

      {/* ORDER NUMBER */}
      <p className="text-[11px] opacity-70">
        Order #{data?._id?.slice(-6) || "----"}
      </p>

      {/* STATUS */}
      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[data.status]}`}>
        {data.status}
      </span>

      {/* 💰 PRICE */}
      <div className="mt-2">
        {data.finalPrice ? (
          <p className="text-green-600 font-bold">
            💰 ${final}
          </p>
        ) : data.price ? (
          <p className="text-yellow-600">
            💲 ${data.price} (est)
          </p>
        ) : (
          <p className="text-gray-400">
            💲 Not priced
          </p>
        )}

        {shipping > 0 && (
          <p className="text-xs text-gray-500">
            🚚 Shipping: ${shipping}
          </p>
        )}
      </div>

      {/* MESSAGE */}
      {data.message && (
        <p className="text-xs mt-2 text-gray-500">
          💬 {data.message}
        </p>
      )}

      {/* ITEMS */}
      <div className="text-sm mt-2">
        {data.items?.map((item, i) => (
          <p key={i}>{item.name} x{item.quantity}</p>
        ))}
      </div>

{/* TIMELINE */}
<Timeline timeline={data.timeline} />

      {/* TRACKING */}
      {data.status !== "shipped" && (
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