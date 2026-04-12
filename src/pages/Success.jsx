import { useEffect, useState } from "react"
import { useSearchParams, useNavigate, useParams } from "react-router-dom"
import useCart from "../hooks/useCart"
import api from "../services/api"

export default function Success() {

  const [searchParams] = useSearchParams()
  const { id } = useParams() // 🔥 for Square redirect
  const navigate = useNavigate()
  const { clearCart } = useCart()

  const [status, setStatus] = useState("loading")

  const sessionId = searchParams.get("session_id")

  useEffect(() => {

    const handleSuccess = async () => {
      try {

        console.log("🔥 SUCCESS PAGE HIT")

        /* ================= STRIPE FALLBACK ================= */
        if (sessionId) {
          console.log("💳 Stripe success:", sessionId)
        }

        /* ================= SQUARE FLOW ================= */
        if (id) {
          console.log("💳 Square success for order:", id)

          await api.patch(`/orders/update-status/${id}`, {
            status: "paid"
          })
        }

        /* ================= FINALIZE ================= */
        setStatus("paid")

        clearCart()
        localStorage.removeItem("cart")

      } catch (err) {
        console.error("❌ SUCCESS ERROR:", err)
        setStatus("error")
      }
    }

    handleSuccess()

  }, [sessionId, id, clearCart])

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
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <h2>Something went wrong.</h2>
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