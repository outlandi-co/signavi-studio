import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../services/api"

export default function ClientCheckout() {
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
  const [loadingRates, setLoadingRates] = useState(false)
  const [saving, setSaving] = useState(false)

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    const { name, value } = e.target

    setForm({
      ...form,
      [name]:
        name === "state"
          ? value.toUpperCase().slice(0, 2)
          : name === "country"
          ? value.toUpperCase()
          : value
    })
  }

  /* ================= VALIDATE ================= */
  const validateForm = () => {
    const required = ["name", "street1", "city", "state", "zip", "country"]

    for (let field of required) {
      if (!form[field]) {
        alert(`Missing ${field}`)
        return false
      }
    }

    if (form.state.length !== 2) {
      alert("State must be 2 letters (e.g., CA)")
      return false
    }

    return true
  }

  /* ================= GET SHIPPING RATES ================= */
  const getRates = async () => {
    try {
      if (!validateForm()) return

      setLoadingRates(true)
      setSelectedRate(null)

      console.log("📦 Getting rates with:", form)

      const res = await api.post("/shipping/get-rates", {
        address_to: form
      })

      console.log("📦 SHIPPING RESPONSE:", res.data)

      const incomingRates = res.data?.rates || []

      if (!incomingRates.length) {
        alert("No shipping rates found")
      }

      setRates(incomingRates)

    } catch (err) {
      console.error("❌ RATE ERROR:", err.response?.data || err.message)
      alert("Failed to get shipping rates")
    } finally {
      setLoadingRates(false)
    }
  }

  /* ================= SUBMIT (🔥 FIXED) ================= */
  const handleSubmit = async () => {
    try {
      if (!selectedRate) {
        alert("Select a shipping option")
        return
      }

      setSaving(true)

      const payload = {
        shippingAddress: form,
        shippingCost: Number(selectedRate.amount),
        shippingRateId: selectedRate.object_id,
        carrier: selectedRate.provider,
        serviceLevel: selectedRate.servicelevel?.name
      }

      console.log("🚚 SAVING SHIPPING:", payload)

      /* 🔥 WAIT FOR BACKEND UPDATE */
      const res = await api.patch(`/orders/${id}/checkout`, payload)

      console.log("✅ ORDER UPDATED:", res.data)

      /* 🔥 HARD VERIFY FINAL PRICE */
      const updatedOrder = res.data?.data

      if (!updatedOrder || !updatedOrder.finalPrice || updatedOrder.finalPrice <= 0) {
        console.error("❌ BAD ORDER AFTER SAVE:", updatedOrder)
        alert("Order total not calculated. Please try again.")
        setSaving(false)
        return
      }

      /* 🔥 SAVE FOR UI */
      localStorage.setItem(
        "shippingRate",
        JSON.stringify({
          amount: selectedRate.amount
        })
      )

      console.log("➡️ PROCEEDING TO PAYMENT")

      /* 🔥 DELAY TO ENSURE DB SYNC (Render safety) */
      setTimeout(() => {
        navigate(`/checkout/${id}`)
      }, 300)

    } catch (err) {
      console.error("❌ SAVE ERROR:", err.response?.data || err.message)
      alert("Failed to save shipping")
    } finally {
      setSaving(false)
    }
  }

  /* ================= UI ================= */
  return (
    <div style={{ padding: 20, color: "white", maxWidth: 420 }}>
      <h2>📦 Shipping Info</h2>

      {Object.keys(form).map((key) => (
        <input
          key={key}
          name={key}
          placeholder={key.toUpperCase()}
          value={form[key]}
          onChange={handleChange}
          style={{
            display: "block",
            marginBottom: 10,
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: "1px solid #333",
            background: "#020617",
            color: "white"
          }}
        />
      ))}

      <button onClick={getRates} disabled={loadingRates} style={btn}>
        {loadingRates ? "Getting rates..." : "📦 Get Shipping Rates"}
      </button>

      {rates.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Select Shipping</h3>

          {rates.map((r) => (
            <label key={r.object_id} style={rateBox}>
              <input
                type="radio"
                name="shipping"
                onChange={() => setSelectedRate(r)}
              />
              <div>
                <strong>{r.provider}</strong>
                <p>{r.servicelevel?.name}</p>
                <p style={{ color: "#22c55e" }}>
                  ${Number(r.amount).toFixed(2)}
                </p>
              </div>
            </label>
          ))}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={saving || !rates.length}
        style={{
          ...btn,
          marginTop: 20,
          background: "#22c55e"
        }}
      >
        {saving ? "Saving..." : "Continue to Payment"}
      </button>
    </div>
  )
}

/* ================= STYLES ================= */

const btn = {
  width: "100%",
  padding: 12,
  marginTop: 10,
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  background: "#06b6d4",
  color: "#000",
  fontWeight: "bold"
}

const rateBox = {
  display: "flex",
  gap: 10,
  padding: 10,
  border: "1px solid #1e293b",
  borderRadius: 8,
  marginBottom: 10,
  cursor: "pointer"
}