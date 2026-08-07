import { useState } from "react"
import api from "../../services/api"

export default function AdminEmailPanel({ customer }) {
  const [channel, setChannel] = useState("info")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  if (!customer) return null

  const email =
    customer.email ||
    customer.customerEmail ||
    customer.user?.email ||
    ""

  const customerName =
    customer.name ||
    customer.customerName ||
    customer.fullName ||
    ""

  const fromEmail =
    channel === "quotes"
      ? "quotes@signavistudio.store"
      : "info@signavistudio.store"

  const handleChannelChange = (value) => {
    setChannel(value)

    if (value === "quotes") {
      setSubject(
        customerName
          ? `Quote Information - ${customerName}`
          : "SignaVi Studio Quote"
      )
    } else {
      setSubject("")
    }
  }

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
          subject: subject.trim(),
          message: message.trim(),

          channel,

          customerId:
            customer._id ||
            customer.id ||
            null,

          customerName
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      console.log(
        "✅ EMAIL RESPONSE:",
        res.data
      )

      alert(
        channel === "quotes"
          ? "Quote email sent successfully"
          : "Information email sent successfully"
      )

      setSubject("")
      setMessage("")
    } catch (err) {
      console.error(
        "❌ EMAIL ERROR:",
        err.response?.data ||
          err.message
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
      <div style={header}>
        <div>
          <h2 style={title}>
            Customer Email
          </h2>

          <p style={subtitle}>
            Send customer communication from a
            public SignaVi Studio address.
          </p>
        </div>
      </div>

      {/* ================= FROM TYPE ================= */}

      <div style={field}>
        <label style={label}>
          Email Type
        </label>

        <div style={channelButtons}>
          <button
            type="button"
            onClick={() =>
              handleChannelChange("info")
            }
            style={{
              ...channelButton,
              ...(channel === "info"
                ? activeChannelButton
                : {})
            }}
          >
            Information
          </button>

          <button
            type="button"
            onClick={() =>
              handleChannelChange("quotes")
            }
            style={{
              ...channelButton,
              ...(channel === "quotes"
                ? activeChannelButton
                : {})
            }}
          >
            Quote
          </button>
        </div>
      </div>

      {/* ================= FROM ================= */}

      <div style={field}>
        <label style={label}>
          From
        </label>

        <input
          type="text"
          value={fromEmail}
          disabled
          style={inputDisabled}
        />
      </div>

      {/* ================= TO ================= */}

      <div style={field}>
        <label style={label}>
          To
        </label>

        <input
          type="text"
          value={email}
          disabled
          style={inputDisabled}
        />
      </div>

      {/* ================= SUBJECT ================= */}

      <div style={field}>
        <label style={label}>
          Subject
        </label>

        <input
          type="text"
          placeholder={
            channel === "quotes"
              ? "Enter quote subject..."
              : "Enter subject..."
          }
          value={subject}
          onChange={(e) =>
            setSubject(e.target.value)
          }
          style={input}
        />
      </div>

      {/* ================= MESSAGE ================= */}

      <div style={field}>
        <label style={label}>
          Message
        </label>

        <textarea
          placeholder={
            channel === "quotes"
              ? "Write quote information..."
              : "Write message..."
          }
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          rows={10}
          style={textarea}
        />
      </div>

      {/* ================= SEND ================= */}

      <button
        onClick={handleSend}
        disabled={sending}
        style={{
          ...button,
          opacity: sending ? 0.7 : 1,
          cursor:
            sending
              ? "not-allowed"
              : "pointer"
        }}
      >
        {sending
          ? "Sending..."
          : channel === "quotes"
            ? "Send Quote Email"
            : "Send Information Email"}
      </button>

      <div style={privacyNotice}>
        <strong>
          Internal admin email is hidden.
        </strong>

        <span>
          Customers only see the public
          SignaVi Studio email address selected
          above.
        </span>
      </div>
    </div>
  )
}

/* ================= STYLES ================= */

const container = {
  marginTop: 30,
  padding: 22,
  borderRadius: 14,
  background: "#0f172a",
  border: "1px solid #1e293b",
  color: "#fff"
}

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 24
}

const title = {
  margin: 0,
  fontSize: 22
}

const subtitle = {
  marginTop: 6,
  marginBottom: 0,
  color: "#94a3b8",
  fontSize: 14
}

const field = {
  marginBottom: 18
}

const label = {
  display: "block",
  marginBottom: 7,
  fontWeight: "600",
  fontSize: 14
}

const input = {
  width: "100%",
  boxSizing: "border-box",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#020617",
  color: "#fff",
  outline: "none"
}

const inputDisabled = {
  ...input,
  opacity: 0.75,
  cursor: "not-allowed"
}

const textarea = {
  width: "100%",
  boxSizing: "border-box",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#020617",
  color: "#fff",
  resize: "vertical",
  outline: "none"
}

const channelButtons = {
  display: "flex",
  gap: 10
}

const channelButton = {
  flex: 1,
  padding: "11px 14px",
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#020617",
  color: "#cbd5e1",
  cursor: "pointer",
  fontWeight: "600"
}

const activeChannelButton = {
  background: "#164e63",
  border: "1px solid #22d3ee",
  color: "#fff"
}

const button = {
  width: "100%",
  padding: 14,
  border: "none",
  borderRadius: 10,
  background: "#22c55e",
  color: "#fff",
  fontWeight: "700"
}

const privacyNotice = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  marginTop: 14,
  padding: 12,
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 8,
  color: "#94a3b8",
  fontSize: 12
}