import { useState } from "react"
import api from "../services/api"

export default function QuotePage() {
  const [file, setFile] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log("🔥 FORM SUBMITTED")

    if (!file) {
      alert("Upload a file first")
      return
    }

    const formData = new FormData()
    formData.append("customerName", "Test User")
    formData.append("email", "test@email.com")
    formData.append("quantity", 1)
    formData.append("price", 10)
    formData.append("artwork", file)

    try {
      const res = await api.post("/quotes", formData)

      console.log("✅ SUCCESS:", res.data)

    } catch (err) {
      console.error("❌ ERROR:", err.response?.data || err.message)
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

        <button type="submit">
          Submit
        </button>
      </form>
    </div>
  )
}