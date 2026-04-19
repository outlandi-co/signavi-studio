import { useEffect, useState, useRef, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import useCart from "../hooks/useCart"
import api from "../services/api"

export default function Success() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clearCart } = useCart()

  const [status, setStatus] = useState("loading")
  const [retrying, setRetrying] = useState(false)

  const hasRun = useRef(false)

  /* ================= ERROR LOGGER ================= */
  const logError = useCallback(async (context, error) => {
    console.error(`❌ ${context}:`, error)

    try {
      await api.post("/logs", {
        context,
        message: error?.message || "Unknown error",
        stack: error?.stack || null,
        orderId: id
      })
    } catch (logErr) {
      console.warn("⚠️ Failed to send log:", logErr)
    }
  }, [id])

  /* ================= CONFIRM PAYMENT ================= */
  useEffect(() => {
    const confirmPayment = async () => {
      if (hasRun.current) return
      hasRun.current = true

      try {
        if (!id) {
          throw new Error("Missing order ID")
        }

        console.log("💳 Confirming payment:", id)

        await api.post(`/square/confirm/${id}`)

        console.log("✅ Payment confirmed")

        setStatus("paid")

        clearCart()
        localStorage.removeItem("cart")

      } catch (err) {
        await logError("CONFIRM PAYMENT", err)
        setStatus("error")
      }
    }

    confirmPayment()

  }, [id, clearCart, logError])

  /* ================= RETRY ================= */
  const handleRetry = async () => {
    try {
      setRetrying(true)

      await api.post(`/square/confirm/${id}`)

      setStatus("paid")

      clearCart()
      localStorage.removeItem("cart")

    } catch (err) {
      await logError("RETRY PAYMENT", err)
      alert("Still failed. Contact support.")
    } finally {
      setRetrying(false)
    }
  }

  /* ================= UI ================= */

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <h2 className="animate-pulse text-lg">
          Processing your payment...
        </h2>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center p-6">
        <h2 className="text-red-400 text-xl mb-2">
          ⚠️ Payment received but confirmation failed
        </h2>

        <p className="text-gray-400 mb-6 max-w-md">
          Your payment likely went through, but we couldn’t finalize your order.
        </p>

        <div className="flex gap-4">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="bg-yellow-500 px-6 py-2 rounded text-black font-semibold"
          >
            {retrying ? "Retrying..." : "Retry"}
          </button>

          <button
            onClick={() => window.location.reload()}
            className="bg-gray-700 px-6 py-2 rounded"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold text-green-400 mb-4">
        ✅ Payment Successful
      </h1>

      <p className="mb-6 text-gray-300 max-w-md">
        Your order is confirmed and has been moved into production.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => navigate("/store")}
          className="bg-cyan-500 px-6 py-2 rounded text-black font-semibold"
        >
          Continue Shopping
        </button>

        <button
          onClick={() => navigate("/")}
          className="bg-gray-700 px-6 py-2 rounded"
        >
          Go Home
        </button>
      </div>
    </div>
  )
}