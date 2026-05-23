import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"

export default function CustomQuote() {
  const location = useLocation()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    email: "",
    quantity: 1,
    printType: "laser",
    notes: location.state?.idea || ""
  })

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const pricing = {
    laser: {
      label: "Laser Engraving",
      base: 15,
      setup: 10,
      minimum: 25
    },
    vinyl: {
      label: "Vinyl Printing",
      base: 18,
      setup: 15,
      minimum: 30
    },
    digital: {
      label: "Digital Services",
      base: 75,
      setup: 0,
      minimum: 75
    }

    /*
    screenprint: { label: "Screen Print", base: 8, setup: 20, minimum: 50 },
    dtf: { label: "DTF Transfer", base: 6, setup: 0, minimum: 35 },
    embroidery: { label: "Embroidery", base: 10, setup: 30, minimum: 60 }
    */
  }

  const selectedService = pricing[form.printType] || {
    label: "Service",
    base: 0,
    setup: 0,
    minimum: 0
  }

  const qty = Number(form.quantity || 1)

  let discount = 1
  let discountMsg = ""

  if (qty >= 100) {
    discount = 0.75
    discountMsg = "🔥 25% bulk discount applied"
  } else if (qty >= 50) {
    discount = 0.85
    discountMsg = "🔥 15% bulk discount applied"
  } else if (qty >= 12) {
    discount = 0.93
    discountMsg = "🔥 7% bulk discount applied"
  } else {
    discountMsg = "💡 Order 12+ to unlock discounts"
  }

  const rawEstimate =
    selectedService.base * qty * discount +
    selectedService.setup

  const estimate = Math.max(rawEstimate, selectedService.minimum)

  const perItemEstimate = estimate / qty

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value
    }))
  }

  const handleFile = (e) => {
    const selected = e.target.files[0]
    if (!selected) return

    setFile(selected)

    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(selected))
  }

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name || !form.email) {
      alert("Please fill out name and email")
      return
    }

    setLoading(true)

    try {
      const API =
        import.meta.env.VITE_API_URL ||
        "http://localhost:5050/api"

      const payload = {
        customerName: form.name,
        email: form.email,
        quantity: qty,
        printType: form.printType,
        serviceType: form.printType,
        serviceLabel: selectedService.label,
        price: estimate,
        items: [
          {
            name: selectedService.label,
            quantity: qty,
            price: estimate
          }
        ],
        notes: form.notes,
        artwork: file?.name || ""
      }

      const res = await axios.post(`${API}/quotes`, payload)

      const quoteId =
        res?.data?.data?._id ||
        res?.data?._id ||
        null

      if (!quoteId) {
        alert("Quote created but failed to redirect")
        return
      }

      navigate(`/quote/${quoteId}`)
    } catch (err) {
      console.error("❌ ERROR:", err.response?.data || err.message)
      alert("Server error")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    padding: "12px",
    borderRadius: "8px",
    background: "#020617",
    border: "1px solid #374151",
    color: "#fff"
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      color: "#fff",
      padding: "40px",
      display: "flex",
      justifyContent: "center"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "500px",
        background: "#111827",
        padding: "30px",
        borderRadius: "16px"
      }}>
        <h1>Request a Custom Quote</h1>

        <div style={{
          margin: "15px 0",
          padding: "12px",
          background: "#020617",
          borderRadius: "8px",
          border: "1px solid #06b6d4"
        }}>
          <div style={{ fontSize: "18px", fontWeight: "bold" }}>
            💰 Starting Price at: ${estimate.toFixed(2)}
          </div>

          <div style={{ fontSize: "13px", opacity: 0.7 }}>
            ${perItemEstimate.toFixed(2)} per item
          </div>

          <div style={{ fontSize: "13px", color: "#38bdf8" }}>
            {discountMsg}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            min="1"
            style={inputStyle}
          />

          <select
            name="printType"
            value={form.printType}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="laser">Laser Engraving</option>
            <option value="vinyl">Vinyl Printing</option>
            <option value="digital">Digital Services</option>

            {/*
            <option value="screenprint">Screen Print</option>
            <option value="dtf">DTF Transfer</option>
            <option value="embroidery">Embroidery</option>
            */}
          </select>

          <textarea
            name="notes"
            placeholder="Describe your project..."
            value={form.notes}
            onChange={handleChange}
            style={inputStyle}
          />

          <input type="file" onChange={handleFile} />

          {preview && (
            <img
              src={preview}
              alt="preview"
              style={{ width: "200px", borderRadius: "8px" }}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px",
              background: "#06b6d4",
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Submitting..." : "Submit Quote"}
          </button>
        </form>
      </div>
    </div>
  )
}