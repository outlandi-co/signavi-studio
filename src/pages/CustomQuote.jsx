import { useState } from "react"
import api from "../services/api"

function CustomQuote() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    quantity: 1,
    printType: "screenprint",
    notes: ""
  })

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  /* HANDLE INPUT */
  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  /* HANDLE FILE */
  const handleFile = (e) => {
    const selected = e.target.files[0]
    if (!selected) return

    setFile(selected)

    // cleanup old preview
    if (preview) URL.revokeObjectURL(preview)

    setPreview(URL.createObjectURL(selected))
  }

  /* SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name || !form.email) {
      alert("Please fill out name and email")
      return
    }

    setLoading(true)

    try {
      const data = new FormData()

      // 🔥 EXPLICIT APPEND (prevents undefined bugs)
      data.append("name", form.name)
      data.append("email", form.email)
      data.append("quantity", String(form.quantity))
      data.append("printType", form.printType)
      data.append("notes", form.notes || "")

      if (file) {
        data.append("artwork", file)
      }

      // 🔥 DO NOT manually set Content-Type
      await api.post("/quotes", data)

      alert("🔥 Quote submitted successfully!")

      // RESET
      setForm({
        name: "",
        email: "",
        quantity: 1,
        printType: "screenprint",
        notes: ""
      })

      setFile(null)

      if (preview) URL.revokeObjectURL(preview)
      setPreview(null)

    } catch (err) {
      console.error("❌ Submit error:", err.response?.data || err.message)

      alert(
        err.response?.data?.error ||
        "Server error — check backend console"
      )

    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      color: "#fff",
      padding: "40px"
    }}>

      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
        Request a Custom Quote
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: "500px",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}
      >

        <input
          name="name"
          placeholder="Name"
          value={form.name}
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
          type="number"
          value={form.quantity}
          onChange={handleChange}
          min="1"
        />

        <select
          name="printType"
          value={form.printType}
          onChange={handleChange}
        >
          <option value="screenprint">Screen Print</option>
          <option value="dtf">DTF Transfer</option>
          <option value="embroidery">Embroidery</option>
        </select>

        <textarea
          name="notes"
          placeholder="Describe your project..."
          value={form.notes}
          onChange={handleChange}
        />

        {/* FILE */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
        />

        {/* PREVIEW */}
        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{
              width: "100%",
              borderRadius: "10px",
              marginTop: "10px"
            }}
          />
        )}

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "10px",
            padding: "12px",
            background: loading ? "#555" : "#22c55e",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            borderRadius: "6px"
          }}
        >
          {loading ? "Submitting..." : "Submit Quote"}
        </button>

        <p style={{ fontSize: "12px", opacity: 0.7 }}>
          Upload your design or describe your idea — we’ll handle the rest.
        </p>

      </form>

    </div>
  )
}

export default CustomQuote