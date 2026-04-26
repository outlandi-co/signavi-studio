import { useNavigate } from "react-router-dom"
import { useState } from "react"
import api from "../services/api"

export default function Cart() {

  const navigate = useNavigate()

  /* ================= LOAD STATE DIRECTLY ================= */
  const [items] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cartItems") || "[]")
    } catch {
      return []
    }
  })

  const [shipping] = useState(() => {
    try {
      const saved = localStorage.getItem("shippingRate")
      if (!saved) return 0
      return Number(JSON.parse(saved).amount)
    } catch {
      return 0
    }
  })

  /* ================= CALCULATIONS ================= */
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.price || 0) * (item.quantity || 1)
  }, 0)

  const taxRate = 0.0825
  const tax = subtotal * taxRate

  const total = subtotal + tax + shipping

  /* ================= CHECKOUT ================= */
  const handleCheckout = async () => {
    try {
      console.log("🛒 Creating order before checkout...")

      const email = localStorage.getItem("customerEmail")

      if (!email) {
        alert("Please login first")
        return
      }

      const res = await api.post("/orders", {
        email,
        items
      })

      console.log("📦 ORDER CREATED:", res.data)

      const orderId = res.data?.data?._id

      if (!orderId) {
        throw new Error("Order ID missing")
      }

      console.log("✅ ORDER ID:", orderId)

      navigate(`/client-checkout/${orderId}`)

    } catch (err) {
      console.error("❌ CHECKOUT ERROR:", err)
      alert("Failed to start checkout")
    }
  }

  /* ================= EMPTY ================= */
  if (!items.length) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl mb-4">🛒 Cart is empty</h1>

        <button
          onClick={() => navigate("/store")}
          className="bg-gray-700 px-6 py-2 rounded text-white"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-2xl mb-6">🛒 Cart</h1>

      {/* ITEMS */}
      <div className="mb-6">
        {items.map((item, i) => (
          <div key={i} className="mb-2 text-gray-300">
            {item.name} × {item.quantity} — $
            {(item.price * item.quantity).toFixed(2)}
          </div>
        ))}
      </div>

      {/* SUMMARY */}
      <div className="bg-[#111827] p-4 rounded max-w-md">

        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        <p>Tax: ${tax.toFixed(2)}</p>

        <p>
          Shipping:{" "}
          {shipping > 0
            ? `$${shipping.toFixed(2)}`
            : "Calculated at checkout"}
        </p>

        <hr className="my-2 border-gray-700" />

        <p className="text-lg font-semibold">
          Total: ${total.toFixed(2)}
        </p>

        <button
          onClick={handleCheckout}
          className="mt-4 bg-cyan-500 px-6 py-2 rounded text-black w-full"
        >
          💳 Checkout
        </button>

      </div>

      <button
        onClick={() => navigate("/store")}
        className="mt-4 bg-gray-700 px-6 py-2 rounded text-white"
      >
        Continue Shopping
      </button>

    </div>
  )
}