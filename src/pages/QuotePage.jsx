import { useState } from "react"
import api from "../services/api"

export default function QuotePage() {
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    quantity: "",
    price: "",
    notes: ""
  })

  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleFile = (e) => {
    setFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log("🔥 SUBMIT CLICKED")

    if (!file) {
      alert("Upload artwork first")
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()

      formData.append("customerName", form.customerName)
      formData.append("email", form.email)
      formData.append("quantity", form.quantity)
      formData.append("price", form.price)
      formData.append("notes", form.notes)
      formData.append("artwork", file)

      const res = await api.post("/quotes", formData)

      console.log("✅ CREATED:", res.data)

      alert("Quote created!")

    } catch (err) {
      console.error("❌ ERROR:", err.response?.data || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Create Quote</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>

        <input name="customerName" placeholder="Name" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="quantity" placeholder="Quantity" onChange={handleChange} />
        <input name="price" placeholder="Price" onChange={handleChange} />
        <textarea name="notes" placeholder="Notes" onChange={handleChange} />

        <input type="file" onChange={handleFile} />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Quote"}
        </button>

      </form>
    </div>
  )
}