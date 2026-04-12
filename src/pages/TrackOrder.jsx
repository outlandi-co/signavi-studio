import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import { io } from "socket.io-client"
import api from "../services/api"

const API_URL = import.meta.env.VITE_API_URL || "https://signavi-backend.onrender.com/api"
const SOCKET_URL = API_URL.replace("/api", "")

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

  /* LOAD */
  useEffect(() => {
    if (!id) return

    const load = async () => {
      try {
        const res = await api.get(`/orders/${id}`)
        setOrder(res.data.data)
      } catch {
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  /* AUTO DELIVER FIX */
  useEffect(() => {
    if (!order) return

    if (order.status === "shipped" && !hasAutoDelivered.current) {
      hasAutoDelivered.current = true

      api.patch(`/orders/update-status/${id}`, {
        status: "delivered"
      })
    }
  }, [order, id])

  /* SOCKET */
  useEffect(() => {
    if (!id) return

    socketRef.current = io(SOCKET_URL)

    socketRef.current.on("jobUpdated", (updated) => {
      if (updated._id === id) {
        setOrder(updated)
      }
    })

    return () => socketRef.current.disconnect()
  }, [id])

  /* UI */

  if (loading) return <div className="text-white text-center mt-10">Loading...</div>
  if (!order) return <div className="text-white text-center mt-10">Order not found</div>

  const currentStep = steps.indexOf(order.status)

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">

      <h1 className="text-2xl text-center mb-4">📦 Track Order</h1>

      {/* PROGRESS */}
      <div className="flex gap-2 mb-6">
        {steps.map((step, i) => (
          <div key={step} className="flex-1 text-center">
            <div className={`h-2 rounded-full ${i <= currentStep ? "bg-green-500" : "bg-gray-800"}`} />
            <p className="text-xs mt-1">{step}</p>
          </div>
        ))}
      </div>

      {/* TIMELINE */}
      {(order.timeline || []).map((t, i) => (
        <div key={i} className="mb-3 bg-gray-900 p-3 rounded">
          {stepIcons[t.status]} {t.status}
          <div className="text-xs text-gray-400">
            {new Date(t.date).toLocaleString()}
          </div>
        </div>
      ))}

    </div>
  )
}