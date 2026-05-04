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
  const data = order || job || {}

  const [tracking, setTracking] = useState("")
  const [deleting, setDeleting] = useState(false)

  const BASE_URL =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "https://signavi-backend.onrender.com"

  const formatMoney = (v) => Number(v || 0).toFixed(2)

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

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!window.confirm("Delete this item?")) return

    try {
      setDeleting(true)
      await api.delete(`/job/${data._id}`)
      onDelete?.(data._id)
    } catch (err) {
      console.error("❌ DELETE ERROR:", err.response?.data || err.message)
      alert("Delete failed")
    } finally {
      setDeleting(false)
    }
  }

  /* ================= CALCULATIONS ================= */
  const itemsTotal = (data.items || []).reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  )

  const final = Number(data.finalPrice || itemsTotal || 0)
  const shipping = Number(data.shippingCost || 0)

  const statusClass =
    statusColors[data.status] || "bg-gray-200 text-gray-700"

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-xl transition relative">

      {/* DELETE */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="absolute top-2 right-2 text-xs bg-red-500 text-white px-2 py-1 rounded"
      >
        {deleting ? "..." : "Delete"}
      </button>

      {/* CUSTOMER */}
      <p className="font-semibold">
        {data.customerName || "Unknown"}
      </p>

      {/* TYPE */}
      <p className="text-[10px] opacity-60">
        {data.source === "quote" ? "📝 Quote" : "📦 Order"}
      </p>

      {/* ORDER ID */}
      <p className="text-[11px] opacity-70">
        #{data?._id?.slice(-6) || "----"}
      </p>

      {/* STATUS */}
      <span className={`text-xs px-2 py-1 rounded-full ${statusClass}`}>
        {data.status || "unknown"}
      </span>

      {/* IMAGE */}
      <img
        src={
          data.artwork
            ? data.artwork.startsWith("http")
              ? data.artwork
              : `${BASE_URL}${data.artwork.startsWith("/uploads") ? "" : "/uploads/"}${data.artwork}`
            : "/placeholder.png"
        }
        alt="Artwork"
        className="mt-2 w-full h-32 object-cover rounded border"
        onError={(e) => {
          e.target.src = "/placeholder.png"
        }}
      />

      {/* PRICE */}
      <div className="mt-2">
        <p className="text-green-600 font-bold">
          💰 ${formatMoney(final)}
        </p>

        {shipping > 0 && (
          <p className="text-xs text-gray-500">
            🚚 ${formatMoney(shipping)}
          </p>
        )}
      </div>

      {/* ITEMS */}
      <div className="text-sm mt-2">
        {data.items?.map((item, i) => (
          <p key={i}>
            {item.name} x{item.quantity}
          </p>
        ))}
      </div>

      {/* TIMELINE */}
      {data.timeline && <Timeline timeline={data.timeline} />}

      {/* TRACKING */}
      {data.status !== "shipped" && (
        <div className="mt-3">
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
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