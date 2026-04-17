import { useState } from "react"
import api from "../services/api"

export default function QuoteForm() {
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    quantity: "",
    price: "",
    notes: ""
  })

  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  /* ================= HANDLE FILE ================= */
  const handleFile = (e) => {
    const selected = e.target.files[0]
    setFile(selected)
  }

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      alert("⚠️ Please upload artwork")
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()

      // 🔥 TEXT FIELDS
      formData.append("customerName", form.customerName)
      formData.append("email", form.email)
      formData.append("quantity", form.quantity)
      formData.append("price", form.price)
      formData.append("notes", form.notes)

      // 🔥 FILE (THIS WAS MISSING BEFORE)
      formData.append("artwork", file)

      console.log("📦 Sending FormData...")

      const res = await api.post("/quotes", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      console.log("✅ Quote created:", res.data)

      alert("✅ Quote submitted successfully!")

      // reset form
      setForm({
        customerName: "",
        email: "",
        quantity: "",
        price: "",
        notes: ""
      })
      setFile(null)

    } catch (err) {
      console.error("❌ SUBMIT ERROR:", err.response?.data || err.message)
      alert("❌ Failed to submit quote")
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI ================= */
  return (
    <div style={container}>
      <h1 style={title}>📝 Submit a Quote</h1>

      <form onSubmit={handleSubmit} style={formStyle}>

        <input
          name="customerName"
          placeholder="Name"
          value={form.customerName}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          required
        />

        <input
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
        />

        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
        />

        {/* 🔥 FILE INPUT */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          required
        />

        {/* PREVIEW */}
        {file && (
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            style={preview}
          />
        )}

        <button disabled={loading} style={button}>
          {loading ? "Uploading..." : "Submit Quote"}
        </button>

      </form>
    </div>
  )
}

/* ================= STYLES ================= */

const container = {
  padding: 40,
  background: "#020617",
  minHeight: "100vh",
  color: "white",
  textAlign: "center"
}

const title = {
  marginBottom: 20
}

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  maxWidth: 400,
  margin: "0 auto"
}

const preview = {
  width: "100%",
  maxHeight: 150,
  objectFit: "cover",
  borderRadius: 6,
  marginTop: 10
}

const button = {
  padding: "12px",
  background: "#06b6d4",
  border: "none",
  borderRadius: 6,
  fontWeight: "bold",
  cursor: "pointer"
}