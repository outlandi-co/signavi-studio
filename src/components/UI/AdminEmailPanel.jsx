import { useState } from "react"
import api from "../../services/api"

export default function AdminEmailPanel({ customer }) {

  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  const [sending, setSending] = useState(false)

  if (!customer) return null

  const email =
    customer.email ||
    customer.customerEmail ||
    customer.user?.email ||
    ""

  const handleSend = async () => {

    if (!email) {
      alert("Customer email missing")
      return
    }

    if (!subject.trim()) {
      alert("Subject required")
      return
    }

    if (!message.trim()) {
      alert("Message required")
      return
    }

    try {

      setSending(true)

      const token = localStorage.getItem("adminToken")

      const res = await api.post(
        "/admin-email/send-email",
        {
          to: email,
          subject,
          message
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      console.log("✅ EMAIL RESPONSE:", res.data)

      alert("Email sent successfully")

      setSubject("")
      setMessage("")

    } catch (err) {

      console.error(
        "❌ EMAIL ERROR:",
        err.response?.data || err.message
      )

      alert(
        err.response?.data?.message ||
        "Failed to send email"
      )

    } finally {
      setSending(false)
    }
  }

  return (
    <div style={container}>

      <h2 style={title}>
  Admin Panel TEST 123
</h2>

      <div style={field}>
        <label style={label}>To</label>

        <input
          type="text"
          value={email}
          disabled
          style={inputDisabled}
        />
      </div>

      <div style={field}>
        <label style={label}>Subject</label>

        <input
          type="text"
          placeholder="Enter subject..."
          value={subject}
          onChange={(e) =>
            setSubject(e.target.value)
          }
          style={input}
        />
      </div>

      <div style={field}>
        <label style={label}>Message</label>

        <textarea
          placeholder="Write message..."
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          rows={8}
          style={textarea}
        />
      </div>

      <button
        onClick={handleSend}
        disabled={sending}
        style={{
          ...button,
          opacity: sending ? 0.7 : 1
        }}
      >
        {sending
          ? "Sending..."
          : "Send Email"}
      </button>

    </div>
  )
}

/* ================= STYLES ================= */

const container = {
  marginTop: 30,
  padding: 20,
  borderRadius: 14,
  background: "#0f172a",
  border: "1px solid #1e293b",
  color: "#fff"
}

const title = {
  marginBottom: 20
}

const field = {
  marginBottom: 18
}

const label = {
  display: "block",
  marginBottom: 6,
  fontWeight: "600"
}

const input = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#020617",
  color: "#fff",
  outline: "none"
}

const inputDisabled = {
  ...input,
  opacity: 0.7
}

const textarea = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#020617",
  color: "#fff",
  resize: "vertical",
  outline: "none"
}

const button = {
  width: "100%",
  padding: 14,
  border: "none",
  borderRadius: 10,
  background: "#22c55e",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer"
}