import { useState } from "react"
import api from "../../services/api"

export default function AdminSendEmail() {
  const [form, setForm] = useState({
    to: "",
    subject: "",
    message: ""
  })

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSend = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setStatus("")

      await api.post("/admin-email/send-email", form)

      setStatus("✅ Email sent successfully")

      setForm({
        to: "",
        subject: "",
        message: ""
      })
    } catch (err) {
      console.error("❌ SEND EMAIL ERROR:", err)
      setStatus("❌ Failed to send email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-2">📧 Send Email</h1>

      <p className="text-gray-400 mb-6">
        Send a direct email from your SignaVi Studio admin account.
      </p>

      <form
        onSubmit={handleSend}
        className="bg-[#0f172a] border border-white/10 rounded-xl p-6 max-w-2xl"
      >
        <label className="block mb-2 text-sm text-gray-400">To</label>
        <input
          name="to"
          type="email"
          value={form.to}
          onChange={handleChange}
          placeholder="customer@email.com"
          className="w-full mb-4 p-3 rounded bg-[#020617] border border-white/10 outline-none"
        />

        <label className="block mb-2 text-sm text-gray-400">Subject</label>
        <input
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="Email subject"
          className="w-full mb-4 p-3 rounded bg-[#020617] border border-white/10 outline-none"
        />

        <label className="block mb-2 text-sm text-gray-400">Message</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows="8"
          placeholder="Write your message..."
          className="w-full mb-4 p-3 rounded bg-[#020617] border border-white/10 outline-none"
        />

        {status && <p className="mb-4 text-sm">{status}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 text-black font-bold px-5 py-3 rounded disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Email"}
        </button>
      </form>
    </div>
  )
}