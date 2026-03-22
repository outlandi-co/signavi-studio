import { useState } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"

function ClientCheckout() {
  const { id } = useParams()

  const [form, setForm] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "USA"
  })

  const handleSubmit = async () => {
    try {
      await api.patch(`/orders/${id}/checkout`, {
        shippingAddress: form
      })

      alert("✅ Address saved! Next: Payment")

      // 🔥 NEXT STEP (future Stripe)
      // navigate(`/pay/${id}`)

    } catch (err) {
      console.error(err)
      alert("Error saving address")
    }
  }

  return (
    <div style={{ padding: "20px", color: "white", maxWidth: "400px" }}>
      <h2>Checkout</h2>

      {Object.keys(form).map((key) => (
        <input
          key={key}
          placeholder={key.toUpperCase()}
          value={form[key]}
          onChange={(e) =>
            setForm({ ...form, [key]: e.target.value })
          }
          style={{
            display: "block",
            marginBottom: "10px",
            width: "100%",
            padding: "10px"
          }}
        />
      ))}

      <button
        onClick={handleSubmit}
        style={{
          background: "#22c55e",
          padding: "10px",
          borderRadius: "6px",
          border: "none",
          color: "white",
          width: "100%"
        }}
      >
        Continue to Payment
      </button>
    </div>
  )
}

export default ClientCheckout