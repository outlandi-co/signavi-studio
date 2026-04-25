import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../services/api"

function ClientCheckout() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    street1: "",
    city: "",
    state: "",
    zip: "",
    country: "US"
  })

  const [rates, setRates] = useState([])
  const [selectedRate, setSelectedRate] = useState(null)

  /* ================= GET RATES ================= */
  const getRates = async () => {
    try {
      const res = await api.post("/shipping/get-rates", {
        address_to: form
      })

      console.log("🚚 RATES:", res.data)
      setRates(res.data.rates || [])

    } catch (err) {
      console.error("❌ RATE ERROR:", err)
      alert("Failed to get shipping rates")
    }
  }

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    try {
      if (!selectedRate) {
        alert("Select a shipping option")
        return
      }

      await api.patch(`/orders/${id}/checkout`, {
        shippingAddress: form,
        shippingCost: selectedRate.amount,
        shippingRateId: selectedRate.object_id,
        carrier: selectedRate.provider,
        serviceLevel: selectedRate.servicelevel?.name
      })

      alert("✅ Shipping saved!")

      navigate(`/checkout/${id}`) // go to payment page

    } catch (err) {
      console.error(err)
      alert("Error saving checkout")
    }
  }

  return (
    <div style={{ padding: 20, color: "white", maxWidth: 400 }}>
      <h2>Checkout</h2>

      {/* ADDRESS */}
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

      <button onClick={getRates} style={btn}>
        📦 Get Shipping Rates
      </button>

      {/* RATES */}
      {rates.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {rates.map((r) => (
            <label key={r.object_id} style={{ display: "block", marginBottom: 5 }}>
              <input
                type="radio"
                name="rate"
                onChange={() => setSelectedRate(r)}
              />
              {r.provider} - {r.servicelevel?.name} - ${r.amount}
            </label>
          ))}
        </div>
      )}

      <button onClick={handleSubmit} style={btn}>
        Continue to Payment
      </button>
    </div>
  )
}

const btn = {
  background: "#22c55e",
  padding: "10px",
  borderRadius: "6px",
  border: "none",
  color: "white",
  width: "100%",
  marginTop: "10px"
}

export default ClientCheckout