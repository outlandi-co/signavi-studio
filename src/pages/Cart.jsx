import { useState, useEffect, useCallback } from "react"
import useCart from "../hooks/useCart"
import api from "../services/api"

export default function Cart() {

  const { cart, removeFromCart, updateQuantity, clearCart } = useCart()

  const [zip, setZip] = useState(localStorage.getItem("zip") || "")
  const [tax, setTax] = useState(0)
  const [loadingTax, setLoadingTax] = useState(false)
  const [lastZip, setLastZip] = useState(null)
  const [loadingCheckout, setLoadingCheckout] = useState(false)

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const total = subtotal + tax

  const handleApplyZip = useCallback(async () => {
    if (!zip || zip.length !== 5) return
    if (zip === lastZip) return

    try {
      setLoadingTax(true)

      const res = await api.post("/tax/calculate", {
        zip,
        subtotal
      })

      const taxAmount = (res.data.tax || 0) / 100

      setTax(taxAmount)
      setLastZip(zip)

      localStorage.setItem("zip", zip)

    } catch (err) {
      console.error(err)
      setTax(0)
    } finally {
      setLoadingTax(false)
    }
  }, [zip, subtotal, lastZip])

  useEffect(() => {
    if (zip && zip.length === 5 && cart.length > 0 && zip !== lastZip) {
      handleApplyZip()
    }
  }, [zip, cart, lastZip, handleApplyZip])

  const handleCheckout = async () => {
    try {
      setLoadingCheckout(true)

      const res = await fetch(
  `${import.meta.env.VITE_API_URL}/stripe/create-cart-session`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ items: cart })
  }
)

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      }

    } catch (err) {
      console.error("CHECKOUT ERROR:", err)
    } finally {
      setLoadingCheckout(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <h2>Your cart is empty</h2>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-3xl mb-6">🛒 Cart</h1>

      {cart.map(item => (
        <div key={item._id} className="mb-4 border p-3 rounded">
          <p>{item.name}</p>
          <p>${item.price}</p>

          <div className="flex gap-2">
            <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
            <span>{item.quantity}</span>
            <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
          </div>

          <button onClick={() => removeFromCart(item._id)}>
            Remove
          </button>
        </div>
      ))}

      <div className="mt-6 border p-4 rounded">

        <input
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
          placeholder="ZIP"
          maxLength={5}
          className="p-2 text-black"
        />

        <button onClick={handleApplyZip}>
          {loadingTax ? "..." : "Apply"}
        </button>

        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        <p>Tax: {loadingTax ? "Calculating..." : `$${tax.toFixed(2)}`}</p>
        <h2>Total: ${total.toFixed(2)}</h2>

        <button onClick={clearCart}>
          Clear Cart
        </button>

        {/* 🔥 CHECKOUT BUTTON */}
        <button
          onClick={handleCheckout}
          disabled={loadingCheckout}
          style={{
            marginTop: "15px",
            width: "100%",
            padding: "12px",
            background: "#22d3ee",
            color: "#000",
            fontWeight: "bold",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          {loadingCheckout ? "Processing..." : "💳 Checkout"}
        </button>

      </div>

    </div>
  )
}