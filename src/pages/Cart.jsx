import { useNavigate } from "react-router-dom"
import { useState } from "react"

export default function Cart() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleCheckout = () => {
    try {
      setLoading(true)

      const orderId = localStorage.getItem("lastOrderId")

      if (!orderId) {
        alert("No order found")
        setLoading(false)
        return
      }

      navigate(`/checkout/${orderId}`)

    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1>🛒 Cart</h1>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="bg-cyan-500 px-6 py-2 rounded text-black"
      >
        {loading ? "Processing..." : "💳 Checkout"}
      </button>

      <button
        onClick={() => navigate("/store")}
        className="mt-4 bg-gray-700 px-6 py-2 rounded text-white"
      >
        Continue Shopping
      </button>
    </div>
  )
}