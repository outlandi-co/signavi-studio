import { useState } from "react"
import api from "../services/api"

export default function QuotePage() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      alert("Upload a file first")
      return
    }

    setLoading(true)

    try {
      /* ================= USER / GUEST ================= */
      const storedUser = JSON.parse(localStorage.getItem("customerUser") || "null")

      let email = storedUser?.email
      let name = storedUser?.name

      if (!email) {
        email = prompt("Enter your email")
        if (!email) throw new Error("Email required")
      }

      if (!name) {
        name = prompt("Enter your name")
        if (!name) throw new Error("Name required")
      }

      /* ================= FORM DATA ================= */
      const formData = new FormData()
      formData.append("customerName", name)
      formData.append("email", email)
      formData.append("quantity", 1)
      formData.append("artwork", file)

      /* ================= API CALL ================= */
      const res = await api.post("/quotes", formData)

      console.log("✅ SUCCESS:", res.data)

      /* ================= FIXED RESPONSE ================= */
      const id = res?.data?.data?._id

      console.log("🆔 QUOTE ID:", id)

      if (!id) {
        throw new Error("No ID returned from server")
      }

      /* ================= REDIRECT ================= */
      window.location.assign(`/quote/${id}`)

    } catch (err) {
      console.error("❌ ERROR:", err.response?.data || err.message)
      alert(err.message || "Server error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Submit a Quote</h1>

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