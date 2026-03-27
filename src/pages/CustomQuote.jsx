import { useState, useEffect } from "react"
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

  /* ================= INPUT ================= */
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  /* ================= FILE ================= */
  const handleFile = (e) => {
    const selected = e.target.files[0]
    if (!selected) return

    setFile(selected)

    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(selected))
  }

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  /* ================= SUBMIT ================= */
const handleSubmit = async (e) => {
  e.preventDefault()

  if (!form.name || !form.email) {
    alert("Please fill out name and email")
    return
  }

  setLoading(true)

  try {
    const data = new FormData()

    /* 🔥 FIX: SEND CORRECT FIELD */
    data.append("customerName", form.name)

    data.append("email", form.email)
    data.append("quantity", form.quantity)
    data.append("printType", form.printType)
    data.append("notes", form.notes)

    if (file) data.append("artwork", file)

    console.log("🚀 Sending FormData:")
    for (let pair of data.entries()) {
      console.log(pair[0], pair[1])
    }

    const res = await api.post("/quotes", data, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })

    console.log("✅ RESPONSE:", res.data)

    alert("🔥 Quote submitted successfully!")

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
    alert("Server error — check backend console")
  } finally {
    setLoading(false)
  }
}

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#fff",
        padding: "40px",
        display: "flex",
        justifyContent: "center"
      }}
    >
      {/* 🔥 CONTAINER */}
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "#111827",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.4)"
        }}
      >

        <h1 style={{ marginBottom: "20px" }}>
          Request a Custom Quote
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}
        >
          
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
          
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
          
          <input name="quantity" type="number" value={form.quantity} onChange={handleChange} min="1" />

          <select name="printType" value={form.printType} onChange={handleChange}>
            <option value="screenprint">Screen Print</option>
            <option value="dtf">DTF Transfer</option>
            <option value="embroidery">Embroidery</option>
          </select>

          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Describe your project..."
          />

          <input type="file" accept="image/*,.ai,.psd,.svg" onChange={handleFile} />

          {preview && (
            <img
              src={preview}
              alt="preview"
              style={{
                width: "200px",
                borderRadius: "8px",
                marginTop: "10px"
              }}
            />
          )}

          {/* 🔥 BUTTON */}
          <button
  type="submit"
  disabled={loading}
  style={{
    marginTop: "10px",
    padding: "14px 26px",
    background: loading
      ? "#374151"
      : "linear-gradient(90deg, #06b6d4, #2563eb)",
    border: "none",
    color: "#fff",
    cursor: loading ? "not-allowed" : "pointer",
    borderRadius: "12px",
    fontWeight: "600",
    letterSpacing: "0.5px",

    display: "flex",
    alignItems: "center",
    gap: "10px",

    boxShadow: loading
      ? "none"
      : "0 10px 25px rgba(0,0,0,0.3)",

    transition: "all 0.2s ease",
    alignSelf: "flex-start",
  }}

  /* 🔥 HOVER */
  onMouseEnter={(e) => {
    if (loading) return
    e.currentTarget.style.transform = "translateY(-2px)"
    e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.45)"
  }}

  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)"
    e.currentTarget.style.boxShadow = loading
      ? "none"
      : "0 10px 25px rgba(0,0,0,0.3)"
  }}

  /* 🔥 CLICK */
  onMouseDown={(e) => {
    if (loading) return
    e.currentTarget.style.transform = "translateY(0) scale(0.96)"
  }}

  onMouseUp={(e) => {
    if (loading) return
    e.currentTarget.style.transform = "translateY(-2px) scale(1)"
  }}
>
  {loading ? (
    <>
      {/* 🔥 SPINNER */}
      <span
        style={{
          width: "16px",
          height: "16px",
          border: "2px solid white",
          borderTop: "2px solid transparent",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }}
      />
      Submitting...
    </>
  ) : (
    "Submit Quote"
  )}

  {/* 🔥 SPINNER KEYFRAME */}
  <style>
    {`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}
  </style>
</button>

        </form>
      </div>
    </div>
  )
}

export default CustomQuote