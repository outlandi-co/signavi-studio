import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

export default function AdminEmails() {
  const navigate = useNavigate()

  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const [to, setTo] = useState("")
  const [cc, setCc] = useState("")

  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  const [history, setHistory] = useState([])
  const [historyFilter, setHistoryFilter] = useState("active")

  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const templates = [
    {
      name: "Quote Ready",
      subject: "Your Quote Is Ready - SignaVi Studio",
      message:
`Hello {{customerName}},

Your quote is now ready for review.

Please review the quote details and let us know if you would like to proceed.

Thank you,
SignaVi Studio`
    },
    {
      name: "Payment Reminder",
      subject: "Payment Reminder - SignaVi Studio",
      message:
`Hello {{customerName}},

This is a friendly reminder that payment is still pending for your order.

If you have already submitted payment, please disregard this message.

Thank you,
SignaVi Studio`
    },
    {
      name: "Production Started",
      subject: "Production Has Started",
      message:
`Hello {{customerName}},

Your project is now in production.

We will notify you once it is completed and ready for shipping or pickup.

Thank you,
SignaVi Studio`
    },
    {
      name: "Shipping Update",
      subject: "Your Order Has Shipped",
      message:
`Hello {{customerName}},

Your order has shipped.

Tracking:
{{tracking}}

Thank you,
SignaVi Studio`
    },
    {
      name: "Mockup Approval",
      subject: "Mockup Ready For Approval",
      message:
`Hello {{customerName}},

Your mockup is ready for approval.

Please review the design and let us know if any revisions are needed.

Thank you,
SignaVi Studio`
    },
    {
      name: "Thank You",
      subject: "Thank You From SignaVi Studio",
      message:
`Hello {{customerName}},

Thank you for choosing SignaVi Studio.

We truly appreciate your support and look forward to working with you again.

Thank you,
SignaVi Studio`
    }
  ]

  const loadCustomers = async () => {
    try {
      const token = localStorage.getItem("adminToken")

      const res = await api.get("/customers", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setCustomers(res.data?.data || [])
    } catch (err) {
      console.error(
        "❌ CUSTOMER LOAD ERROR:",
        err.response?.data || err.message
      )
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem("adminToken")

      const res = await api.get("/admin-email/history", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setHistory(res.data?.data || [])
    } catch (err) {
      console.error(
        "❌ HISTORY ERROR:",
        err.response?.data || err.message
      )
    }
  }

  useEffect(() => {
    const init = async () => {
      await loadCustomers()
      await loadHistory()
    }

    init()
  }, [])

  const filteredHistory = history.filter((email) => {
    if (historyFilter === "active") return !email.archived
    if (historyFilter === "archived") return email.archived
    return true
  })

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer)
    setTo(customer.email || "")
  }

  const applyTemplate = (template) => {
    const customerName =
      selectedCustomer?.name || "Customer"

    const parsedMessage = template.message
      .replace("{{customerName}}", customerName)
      .replace("{{tracking}}", "TRACKING_NUMBER")

    setSubject(template.subject)
    setMessage(parsedMessage)
  }

  const handleSend = async () => {
    if (!to.trim()) {
      alert("Recipient required")
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
          to,
          cc,
          subject,
          message,
          customerId: selectedCustomer?._id,
          customerName: selectedCustomer?.name
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      console.log("✅ EMAIL SENT:", res.data)

      alert("Email sent successfully")

      setSubject("")
      setMessage("")
      setCc("")

      loadHistory()
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

  const archiveEmail = async (id) => {
    try {
      const token = localStorage.getItem("adminToken")

      await api.patch(
        `/admin-email/archive/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      loadHistory()
    } catch (err) {
      console.error(
        "❌ ARCHIVE ERROR:",
        err.response?.data || err.message
      )
    }
  }

  if (loading) {
    return (
      <div style={loadingStyle}>
        <h2>Loading...</h2>
      </div>
    )
  }

  return (
    <div style={page}>
      <h1 style={title}>
        📧 Admin Email Center
      </h1>

      <div style={layout}>
        <div style={sidebar}>
          <div style={emailSidebarTop}>
            <h3 style={sectionTitle}>
              Email Center
            </h3>

            <button
              type="button"
              onClick={() => navigate("/admin/inbox")}
              style={inboxButton}
            >
              📥 Notifications Inbox
            </button>
          </div>

          <h3 style={customerTitle}>
            Customers
          </h3>

          {customers.map((customer) => (
            <button
              key={customer._id}
              onClick={() => handleSelectCustomer(customer)}
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

        <div style={emailPanel}>
          <h2 style={sectionTitle}>
            Compose Email
          </h2>

          <div style={field}>
            <label style={label}>
              Templates
            </label>

            <div style={templateGrid}>
              {templates.map((template) => (
                <button
                  key={template.name}
                  onClick={() => applyTemplate(template)}
                  style={templateButton}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          <div style={field}>
            <label style={label}>
              To
            </label>

            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={input}
            />
          </div>

          <div style={field}>
            <label style={label}>
              CC
            </label>

            <input
              type="text"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="Optional CC"
              style={input}
            />
          </div>

          <div style={field}>
            <label style={label}>
              Subject
            </label>

            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={input}
            />
          </div>

          <div style={field}>
            <label style={label}>
              Message
            </label>

            <textarea
              rows={12}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={textarea}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending}
            style={sendButton}
          >
            {sending ? "Sending..." : "Send Email"}
          </button>
        </div>

        <div style={historyPanel}>
          <div style={filterRow}>
            <button
              onClick={() => setHistoryFilter("active")}
              style={{
                ...filterButton,
                background:
                  historyFilter === "active"
                    ? "#22c55e"
                    : "#111827"
              }}
            >
              Active
            </button>

            <button
              onClick={() => setHistoryFilter("archived")}
              style={{
                ...filterButton,
                background:
                  historyFilter === "archived"
                    ? "#f59e0b"
                    : "#111827"
              }}
            >
              Archived
            </button>

            <button
              onClick={() => setHistoryFilter("all")}
              style={{
                ...filterButton,
                background:
                  historyFilter === "all"
                    ? "#3b82f6"
                    : "#111827"
              }}
            >
              All
            </button>
          </div>

          <h2 style={sectionTitle}>
            📨 Email History
          </h2>

          {filteredHistory.map((email) => (
            <div
              key={email._id}
              style={historyCard}
            >
              <div style={historyTop}>
                <div>
                  <strong>
                    {email.subject}
                  </strong>

                  <p style={historyEmail}>
                    To: {email.to}
                  </p>
                </div>

                {!email.archived && (
                  <button
                    onClick={() => archiveEmail(email._id)}
                    style={archiveButton}
                  >
                    Archive
                  </button>
                )}
              </div>

              <p style={messagePreview}>
                {email.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

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
  gridTemplateColumns: "280px 1fr 420px",
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

const emailPanel = {
  background: "#0f172a",
  borderRadius: 16,
  padding: 24,
  border: "1px solid #1e293b"
}

const historyPanel = {
  background: "#0f172a",
  borderRadius: 16,
  padding: 20,
  border: "1px solid #1e293b",
  height: "80vh",
  overflowY: "auto"
}

const sectionTitle = {
  marginBottom: 20
}

const emailSidebarTop = {
  marginBottom: 20
}

const customerTitle = {
  marginBottom: 18,
  marginTop: 10
}

const inboxButton = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #334155",
  background: "#111827",
  color: "#22d3ee",
  fontWeight: "700",
  cursor: "pointer",
  marginTop: 10
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

const templateGrid = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10
}

const templateButton = {
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#111827",
  color: "#fff",
  cursor: "pointer",
  fontSize: 13
}

const filterRow = {
  display: "flex",
  gap: 10,
  marginBottom: 20,
  flexWrap: "wrap"
}

const filterButton = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid #334155",
  color: "#fff",
  cursor: "pointer"
}

const historyCard = {
  background: "#111827",
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
  border: "1px solid #1f2937"
}

const historyTop = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12
}

const historyEmail = {
  fontSize: 12,
  opacity: 0.7,
  marginTop: 4
}

const messagePreview = {
  marginTop: 14,
  whiteSpace: "pre-wrap"
}

const archiveButton = {
  border: "none",
  background: "#f59e0b",
  color: "#fff",
  borderRadius: 8,
  padding: "8px 12px",
  cursor: "pointer"
}