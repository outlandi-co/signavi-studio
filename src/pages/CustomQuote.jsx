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
    printType: "screenprint",
    notes: location.state?.idea || ""
  })

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const [estimate, setEstimate] = useState(0)
  const [discountMsg, setDiscountMsg] = useState("")

  /* ================= PRICING ================= */
  useEffect(() => {

    const pricing = {
      screenprint: { base: 8, setup: 20 },
      dtf: { base: 6, setup: 0 },
      embroidery: { base: 10, setup: 30 }
    }

    const { base, setup } = pricing[form.printType] || { base: 0, setup: 0 }

    const qty = Number(form.quantity || 0)

    let discount = 1
    let message = ""

    if (qty >= 100) {
      discount = 0.7
      message = "🔥 30% bulk discount applied"
    } else if (qty >= 50) {
      discount = 0.8
      message = "🔥 20% bulk discount applied"
    } else if (qty >= 12) {
      discount = 0.9
      message = "🔥 10% bulk discount applied"
    } else {
      message = "💡 Order 12+ to unlock discounts"
    }

    const total = (base * qty * discount) + setup

    setEstimate(total)
    setDiscountMsg(message)

  }, [form.quantity, form.printType])

  /* ================= INPUT ================= */
  const handleChange = (e) => {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value
    }))
  }

  /* ================= FILE ================= */
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

  /* ================= SUBMIT (🔥 FIXED) ================= */
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

      /* 🔥 SEND JSON INSTEAD OF FORMDATA */
      const payload = {
        customerName: form.name,
        email: form.email,
        quantity: form.quantity,
        printType: form.printType,
        price: estimate,
        items: [
          {
            name: form.printType,
            quantity: form.quantity,
            price: estimate
          }
        ],
        notes: form.notes,
        artwork: file?.name || "" // 🔥 KEY FIX
      }

      console.log("📤 SENDING QUOTE JSON:", payload)

      const res = await axios.post(`${API}/quotes`, payload)

      console.log("🧪 RESPONSE DATA:", res.data)

      const quoteId =
        res?.data?.data?._id ||
        res?.data?._id ||
        null

      console.log("🆔 EXTRACTED ID:", quoteId)

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

  /* ================= UI ================= */

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
            💰 Estimated Price: ${estimate.toFixed(2)}
          </div>

          <div style={{ fontSize: "13px", opacity: 0.7 }}>
            ${(estimate / (form.quantity || 1)).toFixed(2)} per item
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

          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} style={inputStyle} />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} style={inputStyle} />
          <input name="quantity" type="number" value={form.quantity} onChange={handleChange} min="1" style={inputStyle} />

          <select name="printType" value={form.printType} onChange={handleChange} style={inputStyle}>
            <option value="screenprint">Screen Print</option>
            <option value="dtf">DTF Transfer</option>
            <option value="embroidery">Embroidery</option>
          </select>

          <textarea name="notes" placeholder="Describe your project..." value={form.notes} onChange={handleChange} style={inputStyle} />

          <input type="file" onChange={handleFile} />

          {preview && (
            <img src={preview} alt="preview" style={{ width: "200px", borderRadius: "8px" }} />
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
              cursor: "pointer"
            }}
          >
            {loading ? "Submitting..." : "Submit Quote"}
          </button>

        </form>
      </div>
    </div>
  )
}