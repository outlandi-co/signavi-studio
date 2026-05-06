import { useEffect, useState } from "react"
import api from "../../services/api"

export default function AdminEmails() {

  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  /* ================= LOAD CUSTOMERS ================= */

  useEffect(() => {

    const loadCustomers = async () => {

      try {

        const token =
          localStorage.getItem("adminToken")

        const res = await api.get(
          "/customers",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data =
          res.data?.data || []

        setCustomers(data)

      } catch (err) {

        console.error(
          "❌ CUSTOMER LOAD ERROR:",
          err.response?.data || err.message
        )

      } finally {
        setLoading(false)
      }
    }

    loadCustomers()

  }, [])

  /* ================= SEND EMAIL ================= */

  const handleSend = async () => {

    if (!selectedCustomer) {
      alert("Select a customer")
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

      const token =
        localStorage.getItem("adminToken")

      const res = await api.post(
        "/admin-email/send-email",
        {
          to: selectedCustomer.email,
          subject,
          message
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      console.log(
        "✅ EMAIL SENT:",
        res.data
      )

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

  if (loading) {
    return (
      <div style={loadingStyle}>
        <h2>Loading customers...</h2>
      </div>
    )
  }

  return (
    <div style={page}>

      <h1 style={title}>
        📧 Admin Email Center
      </h1>

      <div style={layout}>

        {/* ================= LEFT ================= */}

        <div style={sidebar}>

          <h3 style={{ marginBottom: 20 }}>
            Customers
          </h3>

          {customers.map(customer => (

            <button
              key={customer._id}
              onClick={() =>
                setSelectedCustomer(customer)
              }
              style={{
                ...customerButton,

                background:
                  selectedCustomer?._id === customer._id
                    ? "#22c55e"
                    : "#111827"
              }}
            >

              <strong>
                {customer.name || "Customer"}
              </strong>

              <span style={emailStyle}>
                {customer.email}
              </span>

            </button>

          ))}

        </div>

        {/* ================= RIGHT ================= */}

        <div style={emailPanel}>

          <h2 style={{ marginBottom: 20 }}>
            Compose Email
          </h2>

          <div style={field}>
            <label style={label}>To</label>

            <input
              type="text"
              disabled
              value={
                selectedCustomer?.email || ""
              }
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
              rows={10}
              placeholder="Write your email..."
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              style={textarea}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending}
            style={sendButton}
          >
            {sending
              ? "Sending..."
              : "Send Email"}
          </button>

        </div>

      </div>

    </div>
  )
}

/* ================= STYLES ================= */

const page = {
  padding: 30,
  background: "#020617",
  minHeight: "100vh",
  color: "#fff"
}

const loadingStyle = {
  padding: 40,
  color: "#fff"
}

const title = {
  marginBottom: 30
}

const layout = {
  display: "grid",
  gridTemplateColumns: "320px 1fr",
  gap: 24
}

const sidebar = {
  background: "#0f172a",
  borderRadius: 16,
  padding: 20,
  border: "1px solid #1e293b",
  height: "80vh",
  overflowY: "auto"
}

const customerButton = {
  width: "100%",
  border: "none",
  padding: 14,
  borderRadius: 10,
  marginBottom: 12,
  color: "#fff",
  textAlign: "left",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column"
}

const emailStyle = {
  fontSize: 12,
  opacity: 0.7,
  marginTop: 4
}

const emailPanel = {
  background: "#0f172a",
  borderRadius: 16,
  padding: 24,
  border: "1px solid #1e293b"
}

const field = {
  marginBottom: 20
}

const label = {
  display: "block",
  marginBottom: 8,
  fontWeight: "600"
}

const input = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#020617",
  color: "#fff"
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
  resize: "vertical"
}

const sendButton = {
  width: "100%",
  padding: 14,
  borderRadius: 10,
  border: "none",
  background: "#22c55e",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer"
}