import { useState } from "react"
import useCart from "../hooks/useCart"
import api from "../services/api"

export default function Cart() {

  const { cart, removeFromCart, updateQuantity, clearCart } = useCart()
  const [loadingCheckout, setLoadingCheckout] = useState(false)

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const handleCheckout = async () => {
    try {
      setLoadingCheckout(true)

      const res = await api.post("/stripe/create-cart-session", {
        items: cart
      })

      if (!res?.data?.url) {
        throw new Error("No Stripe URL")
      }

      window.location.assign(res.data.url)

    } catch (err) {
      console.error("CHECKOUT ERROR:", err)
      alert("Checkout failed")
    } finally {
      setLoadingCheckout(false)
    }
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

        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        <p>Tax: Calculated at checkout</p>
        <p>Shipping: Calculated at checkout</p>

        <h2>Total: ${subtotal.toFixed(2)}</h2>

        <button onClick={clearCart}>
          Clear Cart
        </button>

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
            borderRadius: "6px"
          }}
        >
          {loadingCheckout ? "Processing..." : "💳 Checkout"}
        </button>

      </div>
    </div>
  )
}