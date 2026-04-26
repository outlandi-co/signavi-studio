import { useNavigate } from "react-router-dom"
import { useState } from "react"
import api from "../services/api"

export default function Cart() {
  const navigate = useNavigate()

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

  const subtotal = items.reduce((sum, item) => {
    return sum + (Number(item.price) * Number(item.quantity || 1))
  }, 0)

  const tax = subtotal * 0.0825
  const total = subtotal + tax + shipping

  const handleCheckout = async () => {
    try {
      const email = localStorage.getItem("customerEmail")

      if (!email) return alert("Login required")
      if (!items.length) return alert("Cart empty")

      /* 🔥 CLEAN ITEMS */
      const cleanItems = items.map(item => {
        const price = Number(item.price)

        if (!price || price <= 0) {
          throw new Error(`Invalid price for ${item.name}`)
        }

        return {
          productId: item._id || item.id,
          name: item.name,
          quantity: Number(item.quantity || 1),
          price,
          variant: item.variant || {}
        }
      })

      console.log("📦 CLEAN ITEMS:", cleanItems)

      const res = await api.post("/orders", {
        email,
        items: cleanItems
      })

      const orderId = res.data?.data?._id

      if (!orderId) throw new Error("Order not created")

      navigate(`/client-checkout/${orderId}`)

    } catch (err) {
      console.error("❌ CHECKOUT:", err.message)
      alert(err.message)
    }
  }

  if (!items.length) {
    return <div className="text-white text-center">Cart empty</div>
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl mb-6">🛒 Cart</h1>

      {items.map((item, i) => (
        <div key={i}>
          {item.name} × {item.quantity} — $
          {(Number(item.price) * Number(item.quantity)).toFixed(2)}
        </div>
      ))}

      <div className="mt-6">
        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        <p>Tax: ${tax.toFixed(2)}</p>
        <p>Shipping: {shipping ? `$${shipping}` : "Calculated later"}</p>
        <p>Total: ${total.toFixed(2)}</p>

        <button onClick={handleCheckout}>
          Checkout
        </button>
      </div>
    </div>
  )
}