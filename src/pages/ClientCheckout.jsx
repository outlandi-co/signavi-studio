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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const getRates = async () => {
    try {
      const res = await api.post("/shipping/get-rates", {
        address_to: form
      })
      setRates(res.data.rates || [])
    } catch (err) {
      console.error(err)
      alert("Failed to get shipping rates")
    }
  }

  const handleSubmit = async () => {
    if (!selectedRate) {
      alert("Select shipping option")
      return
    }

    await api.patch(`/orders/${id}/checkout`, {
      shippingAddress: form,
      shippingCost: selectedRate.amount,
      shippingRateId: selectedRate.object_id,
      carrier: selectedRate.provider,
      serviceLevel: selectedRate.servicelevel?.name
    })

    navigate(`/checkout/${id}`)
  }

  return (
    <div style={{ padding: 20, color: "white", maxWidth: 400 }}>
      <h2>Shipping Info</h2>

      {Object.keys(form).map((key) => (
        <input
          key={key}
          name={key}
          placeholder={key.toUpperCase()}
          value={form[key]}
          onChange={handleChange}
          style={{ display: "block", marginBottom: 10, width: "100%", padding: 10 }}
        />
      ))}

      <button onClick={getRates}>📦 Get Shipping Rates</button>

      {rates.map((r) => (
        <label key={r.object_id} style={{ display: "block" }}>
          <input type="radio" onChange={() => setSelectedRate(r)} />
          {r.provider} - {r.servicelevel?.name} - ${r.amount}
        </label>
      ))}

      <button onClick={handleSubmit} style={{ marginTop: 10 }}>
        Continue to Payment
      </button>
    </div>
  )
}