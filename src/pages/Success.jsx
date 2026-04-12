import { useEffect, useState, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import useCart from "../hooks/useCart"
import api from "../services/api"

export default function Success() {

  const { id } = useParams()
  const navigate = useNavigate()
  const { clearCart } = useCart()

  const [status, setStatus] = useState("loading")

  /* 🔥 PREVENT DOUBLE CALLS */
  const hasRun = useRef(false)

  useEffect(() => {

    const handleSuccess = async () => {
      if (hasRun.current) return
      hasRun.current = true

      try {
        console.log("🔥 SUCCESS PAGE HIT")

        /* ================= VALIDATION ================= */
        if (!id) {
          console.warn("⚠️ Missing order ID")
          setStatus("error")
          return
        }

        console.log("💳 Square success for order:", id)

        /* ================= UPDATE ORDER ================= */
        await api.patch(`/orders/update-status/${id}`, {
          status: "paid"
        })

        /* ================= FINALIZE ================= */
        setStatus("paid")

        clearCart()
        localStorage.removeItem("cart")

      } catch (err) {
        console.error("❌ SUCCESS ERROR:", err)

        /* 🔥 FAIL SAFE */
        setStatus("error")
      }
    }

    handleSuccess()

  }, [id, clearCart])

  /* ================= UI ================= */

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <h2>Processing payment...</h2>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center">
        <h2 className="text-red-400 text-xl mb-2">
          ⚠️ Payment received but update failed
        </h2>
        <p className="text-gray-400 mb-4">
          Your order may still be processing. Refresh or contact support.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="bg-yellow-500 px-6 py-2 rounded text-black font-semibold"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center p-6">

      <h1 className="text-4xl font-bold text-green-400 mb-4">
        ✅ Payment Successful
      </h1>

      <p className="mb-6 text-gray-300">
        Your order has been received and is now in production.
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