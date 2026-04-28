import { useEffect, useState, useRef, useCallback } from "react"
import { useParams } from "react-router-dom"
import { io } from "socket.io-client"
import api from "../services/api"

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const SOCKET_URL = API_URL.replace("/api", "")

const steps = [
  "payment_required",
  "production",
  "shipping",
  "shipped",
  "delivered"
]

const stepIcons = {
  payment_required: "💳",
  production: "🏭",
  shipping: "📦",
  shipped: "🚚",
  delivered: "✅"
}

export default function TrackOrder() {
  const { id } = useParams()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const socketRef = useRef(null)

  /* ================= LOAD ================= */
  const load = useCallback(async () => {
    try {
      const res = await api.get(`/orders/${id}`)
      setOrder(res.data?.data)
    } catch (err) {
      console.error("❌ LOAD ERROR:", err)
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    if (id) load()
  }, [id, load])

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!id) return

    socketRef.current = io(SOCKET_URL)

    socketRef.current.on("jobUpdated", () => {
      load() // 🔥 always get fresh data
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [id, load])

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="text-white text-center mt-10">
        Loading...
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-white text-center mt-10">
        Order not found
      </div>
    )
  }

  const currentStep = steps.indexOf(order.status)

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">

      <h1 className="text-2xl text-center mb-4">
        📦 Track Order
      </h1>

      <p className="text-center text-gray-400 mb-6">
        Order ID: {order._id}
      </p>

      {/* ================= PROGRESS ================= */}
      <div className="flex gap-2 mb-8">
        {steps.map((step, i) => (
          <div key={step} className="flex-1 text-center">
            <div
              className={`h-2 rounded-full ${
                i <= currentStep ? "bg-green-500" : "bg-gray-800"
              }`}
            />
            <p className="text-xs mt-1">
              {stepIcons[step]} {step}
            </p>
          </div>
        ))}
      </div>

      {/* ================= STATUS MESSAGE ================= */}
      <div className="mb-6 text-center">
        {order.status === "production" && (
          <p className="text-yellow-400">🏭 Your order is in production</p>
        )}

        {order.status === "shipping" && (
          <p className="text-blue-400">📦 Preparing shipment</p>
        )}

        {order.status === "shipped" && (
          <p className="text-green-400">🚚 Your order has shipped</p>
        )}
      </div>

      {/* ================= ITEMS ================= */}
      <div className="mb-6">
        <h2 className="text-lg mb-2">🧾 Items</h2>

        {(order.items || []).map((item, i) => (
          <div key={i} className="bg-gray-900 p-3 rounded mb-2">
            <div className="font-semibold">
              {item.name}
            </div>

            <div className="text-sm text-gray-400">
              {item.variant?.color || "N/A"} / {item.variant?.size || "N/A"}
            </div>

            <div className="text-sm">
              Qty: {item.quantity}
            </div>
          </div>
        ))}
      </div>

      {/* ================= TIMELINE ================= */}
      <div className="mb-6">
        <h2 className="text-lg mb-2">📍 Timeline</h2>

        {(order.timeline || []).map((t, i) => (
          <div key={i} className="mb-3 bg-gray-900 p-3 rounded">
            <div>
              {stepIcons[t.status] || "📌"} {t.status}
            </div>

            <div className="text-xs text-gray-400">
              {t.date ? new Date(t.date).toLocaleString() : ""}
            </div>

            {t.note && (
              <div className="text-xs text-gray-500">
                {t.note}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ================= SHIPPING ================= */}
      <div className="bg-gray-900 p-4 rounded">
        <h2 className="text-lg mb-2">🚚 Shipping</h2>

        {order.status !== "shipped" && (
          <p className="text-gray-400">
            Tracking will appear once your order ships.
          </p>
        )}

        {order.status === "shipped" && (
          <>
            <p className="text-sm text-gray-400">
              Carrier: {order.carrier || "N/A"}
            </p>

            <p className="text-sm">
              Tracking #: {order.trackingNumber || "N/A"}
            </p>

            {order.trackingLink && (
              <a
                href={order.trackingLink}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 underline mt-2 block"
              >
                Track Package
              </a>
            )}
          </>
        )}
      </div>

    </div>
  )
}