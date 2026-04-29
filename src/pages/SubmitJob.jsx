import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import UploadArtwork from "../components/UploadArtwork"

function SubmitJob() {

  const navigate = useNavigate()

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    product: "",
    quantity: "",
    notes: "",
    artwork: ""
  })

  const [loading, setLoading] = useState(false)

  /* 🔥 HANDLE ARTWORK */
  const setArtwork = (fileOrName) => {
    setForm(prev => ({
      ...prev,
      artwork: fileOrName
    }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log("🔥 FORM SUBMIT TRIGGERED")

    if (!form.customerName || !form.product || !form.quantity) {
      alert("Please fill required fields")
      return
    }

    try {
      setLoading(true)

      /* ✅ ALWAYS SEND JSON */
      const payload = {
        customerName: form.customerName,
        email: form.email || "guest@signavi.com",
        quantity: form.quantity,
        product: form.product,
        notes: form.notes || "",
        artwork: form.artwork || ""
      }

      console.log("📤 SENDING QUOTE:", payload)

      const res = await api.post("/quotes", payload)

      console.log("✅ QUOTE RESPONSE:", res.data)

      /* 🔥 SAFE ID EXTRACTION */
      const quoteId =
        res?.data?.data?._id ||
        res?.data?._id ||
        null

      console.log("🆔 QUOTE ID:", quoteId)

      if (!quoteId) {
        alert("Quote created but no ID returned")
        return
      }

      /* 🔥 REDIRECT WORKS NOW */
      navigate(`/quote/${quoteId}`)

    } catch (err) {
      console.error("❌ QUOTE ERROR:", err.response?.data || err.message)
      alert("Failed to submit quote")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "500px" }}>

      <h1>Request a Quote</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}
      >

        <input
          name="customerName"
          placeholder="Customer Name"
          value={form.customerName}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={handleChange}
        />

        <input
          name="product"
          placeholder="Product (Shirt, Hoodie, etc.)"
          value={form.product}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          required
        />

        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
        />

        <UploadArtwork setArtwork={setArtwork} />

        <button
          type="submit"
          style={{
            cursor: "pointer",
            padding: "10px",
            background: "#22c55e",
            border: "none",
            borderRadius: "6px"
          }}
        >
          {loading ? "Submitting..." : "Submit Quote"}
        </button>

      </form>

    </div>
  )
}

export default SubmitJob