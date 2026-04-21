import { useState } from "react"
import api from "../services/api"

export default function QuotePage() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log("🔥 FORM SUBMITTED")

    if (!file) {
      alert("Upload a file first")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("customerName", "Test User")
      formData.append("email", "test@email.com")
      formData.append("quantity", 1)
      formData.append("price", 10)
      formData.append("artwork", file)

      // ✅ DO NOT SET HEADERS
      const res = await api.post("/quotes", formData)

      console.log("✅ SUCCESS:", res.data)

      console.log("🧪 RAW RESPONSE:", res)
console.log("🧪 RESPONSE DATA:", res.data)

const id = res?.data?.debug?._id

console.log("🆔 ID:", id)

if (id) {
  window.location.assign(`/quote/${id}`)
} else {
  alert("No ID returned")
}

console.log("🆔 FINAL ID:", id)

      if (id) {
        window.location.assign(`/quote/${id}`)
      } else {
        alert("Quote created but no ID returned")
      }

    } catch (err) {
      console.error("❌ ERROR:", err.response?.data || err.message)
      alert("Server error — check logs")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Test Quote Submit</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Submit"}
        </button>
      </form>
    </div>
  )
}