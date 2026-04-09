import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import { io } from "socket.io-client"
import api from "../services/api"

const SOCKET_URL = "http://localhost:5050"

const steps = [
  "pending",
  "payment_required",
  "production",
  "shipping",
  "shipped",
  "delivered"
]

const stepIcons = {
  pending: "🕒",
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
  const hasAutoDelivered = useRef(false)

  /* ================= LOAD ================= */
  useEffect(() => {
    if (!id) return

    const load = async () => {
      try {
        setLoading(true)

        const res = await api.get(`/orders/${id}`)
        const data = res.data.data

        setOrder(data)

      } catch (err) {
        console.error("❌ TRACK ERROR:", err)
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  /* ================= AUTO DELIVER ================= */
  useEffect(() => {
    if (!order) return

    if (
      order.status === "shipped" &&
      !hasAutoDelivered.current
    ) {
      hasAutoDelivered.current = true

      api.patch(`/orders/${id}/status`, {
        status: "delivered"
      }).catch(err => {
        console.error("❌ AUTO DELIVER ERROR:", err)
      })
    }
  }, [order, id])

  /* ================= SOCKET (FIXED 🔥) ================= */
  useEffect(() => {
    if (!id) return

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5
      })
    }

    const socket = socketRef.current

    const handleUpdate = (updated) => {
      if (updated._id === id) {
        setOrder(prev => {
          if (
            prev &&
            prev._id === updated._id &&
            prev.status === updated.status
          ) {
            return prev // 🔥 prevent unnecessary rerender
          }
          return updated
        })
      }
    }

    socket.on("jobUpdated", handleUpdate)

    return () => {
      socket.off("jobUpdated", handleUpdate)
    }

  }, [id])

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Order not found
      </div>
    )
  }

  const currentStep = steps.indexOf(order.status)

  const history = order.timeline?.length
    ? order.timeline
    : steps.slice(0, currentStep + 1).map(step => ({
        status: step,
        date: order.updatedAt || order.createdAt
      }))

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">

      <div className="max-w-2xl mx-auto text-center mb-6">
        <h1 className="text-2xl font-bold">📦 Track Order</h1>
        <p className="text-gray-400 text-sm">
          Order #{order._id.slice(-6)}
        </p>
      </div>

      {/* PROGRESS */}
      <div className="max-w-2xl mx-auto flex gap-2 mb-6">
        {steps.map((step, i) => (
          <div key={step} className="flex-1 text-center">
            <div className={`h-2 rounded-full ${i <= currentStep ? "bg-green-500" : "bg-gray-800"}`} />
            <p className="text-[10px] text-gray-400 mt-1">
              {step.replace("_", " ")}
            </p>
          </div>
        ))}
      </div>

      {/* TIMELINE */}
      <div className="max-w-2xl mx-auto border-l border-gray-800 pl-4">
        {history.map((h, i) => (
          <div key={i} className="mb-4 relative">

            <div className="absolute -left-[22px] top-1 w-3 h-3 bg-green-500 rounded-full" />

            <div className="bg-[#0f172a] border border-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <span>{stepIcons[h.status]}</span>
                <span>{h.status}</span>
              </div>

              <p className="text-xs text-gray-500">
                {new Date(h.date).toLocaleString()}
              </p>
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}