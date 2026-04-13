import { useEffect, useState, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import useCart from "../hooks/useCart"
import api from "../services/api"

export default function Success() {

  const { id } = useParams()
  const navigate = useNavigate()
  const { clearCart } = useCart()

  const [status, setStatus] = useState("loading")
  const [retrying, setRetrying] = useState(false)

  /* 🔒 prevent double execution */
  const hasRun = useRef(false)

  useEffect(() => {

    const confirmPayment = async () => {
      if (hasRun.current) return
      hasRun.current = true

      try {
        console.log("🔥 SUCCESS PAGE HIT")

        if (!id) {
          console.warn("⚠️ Missing order ID")
          setStatus("error")
          return
        }

        console.log("💳 Confirming payment for:", id)

        /* ================= 🔥 CORRECT FLOW ================= */
        await api.post(`/square/confirm/${id}`)

        console.log("✅ Payment confirmed")

        setStatus("paid")

        /* 🧹 cleanup */
        clearCart()
        localStorage.removeItem("cart")

      } catch (err) {
        console.error("❌ CONFIRM ERROR:", err.response?.data || err.message)

        setStatus("error")
      }
    }

    confirmPayment()

  }, [id, clearCart])

  /* ================= RETRY ================= */
  const handleRetry = async () => {
    try {
      setRetrying(true)

      await api.post(`/square/confirm/${id}`)

      setStatus("paid")

      clearCart()
      localStorage.removeItem("cart")

    } catch (err) {
      console.error("❌ RETRY FAILED:", err)
      alert("Still failed. Please contact support.")
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
          Tap retry or refresh.
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