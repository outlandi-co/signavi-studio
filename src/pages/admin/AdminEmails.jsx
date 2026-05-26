import {
  useEffect,
  useMemo,
  useState,
  useCallback
} from "react"

import { useNavigate } from "react-router-dom"

import api from "../../services/api"
import EmailThread from "../../components/admin/EmailThread"

const FOLDERS = [
  { id: "compose", label: "✍️ Compose" },
  { id: "inbox", label: "📥 Inbox" },
  { id: "sent", label: "📤 Sent" },
  { id: "drafts", label: "📝 Drafts" },
  { id: "outbox", label: "📦 Outbox" },
  { id: "archive", label: "🗄 Archive" }
]

export default function AdminEmails() {
  const navigate = useNavigate()

  const [activeFolder, setActiveFolder] = useState("compose")
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [emails, setEmails] = useState([])

  const [loading, setLoading] = useState(true)
  const [folderLoading, setFolderLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)

  const [to, setTo] = useState("")
  const [cc, setCc] = useState("")
  const [bcc, setBcc] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState([])

  const token = useMemo(
    () => localStorage.getItem("adminToken"),
    []
  )

  const authHeaders = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
    [token]
  )

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

  const loadCustomers = useCallback(async () => {
    try {
      const res = await api.get(
        "/customers",
        authHeaders
      )

      setCustomers(res.data?.data || [])
    } catch (err) {
      console.error(
        "❌ CUSTOMER LOAD ERROR:",
        err.response?.data || err.message
      )
    } finally {
      setLoading(false)
    }
  }, [authHeaders])

  const loadFolder = useCallback(
    async (folder = activeFolder) => {
      if (folder === "compose") return

      if (folder === "inbox") {
        navigate("/admin/inbox")
        return
      }

      try {
        setFolderLoading(true)

        const res = await api.get(
          `/admin-email/folder/${folder}`,
          authHeaders
        )

        setEmails(res.data?.data || [])
        setSelectedEmail(null)
      } catch (err) {
        console.error(
          "❌ EMAIL FOLDER LOAD ERROR:",
          err.response?.data || err.message
        )

        setEmails([])
        setSelectedEmail(null)
      } finally {
        setFolderLoading(false)
      }
    },
    [activeFolder, authHeaders, navigate]
  )

  useEffect(() => {
    let mounted = true

    const timer = setTimeout(() => {
      if (mounted) {
        loadCustomers()
      }
    }, 0)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [loadCustomers])

  useEffect(() => {
    let mounted = true

    const timer = setTimeout(() => {
      if (mounted) {
        loadFolder(activeFolder)
      }
    }, 0)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [activeFolder, loadFolder])

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer)
    setTo(customer.email || "")
  }

  const applyTemplate = (template) => {
    const customerName =
      selectedCustomer?.name ||
      selectedCustomer?.customerName ||
      "Customer"

    setSubject(template.subject)

    setMessage(
      template.message
        .replaceAll("{{customerName}}", customerName)
        .replaceAll("{{tracking}}", "TRACKING_NUMBER")
    )
  }

  const resetCompose = () => {
    setTo("")
    setCc("")
    setBcc("")
    setSubject("")
    setMessage("")
    setAttachments([])
    setSelectedCustomer(null)
    setSelectedEmail(null)
  }

  const handleReply = (email) => {
    setSelectedEmail(email)
    setTo(email.to || email.from || "")
    setCc("")
    setBcc("")
    setSubject(
      email.subject?.startsWith("RE:")
        ? email.subject
        : `RE: ${email.subject || ""}`
    )

    setMessage(
`\n\n-----------------
${email.message || ""}`
    )

    setActiveFolder("compose")
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

      const formData = new FormData()

      formData.append("to", to)
      formData.append("cc", cc)
      formData.append("bcc", bcc)
      formData.append("subject", subject)
      formData.append("message", message)

      if (selectedCustomer?._id) {
        formData.append("customerId", selectedCustomer._id)
      }

      if (selectedCustomer?.name || selectedCustomer?.customerName) {
        formData.append(
          "customerName",
          selectedCustomer.name || selectedCustomer.customerName
        )
      }

      attachments.forEach((file) => {
        formData.append("attachments", file)
      })

      await api.post(
        "/admin-email/send-email",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      )

      alert("Email sent successfully")
      resetCompose()
      setActiveFolder("sent")
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

  const saveDraft = async () => {
    try {
      setSavingDraft(true)

      await api.post(
        "/admin-email/drafts",
        {
          to,
          cc,
          bcc,
          subject,
          message,
          customerId: selectedCustomer?._id || null,
          customerName:
            selectedCustomer?.name ||
            selectedCustomer?.customerName ||
            ""
        },
        authHeaders
      )

      alert("Draft saved")
      resetCompose()
      setActiveFolder("drafts")
    } catch (err) {
      console.error(
        "❌ SAVE DRAFT ERROR:",
        err.response?.data || err.message
      )

      alert("Draft could not be saved")
    } finally {
      setSavingDraft(false)
    }
  }

  const archiveEmail = async (id) => {
    try {
      await api.patch(
        `/admin-email/archive/${id}`,
        {},
        authHeaders
      )

      await loadFolder(activeFolder)
    } catch (err) {
      console.error(
        "❌ ARCHIVE ERROR:",
        err.response?.data || err.message
      )
    }
  }

  const restoreEmail = async (id) => {
    try {
      await api.patch(
        `/admin-email/restore/${id}`,
        {},
        authHeaders
      )

      await loadFolder(activeFolder)
    } catch (err) {
      console.error(
        "❌ RESTORE ERROR:",
        err.response?.data || err.message
      )
    }
  }

  const sendDraft = async (id) => {
    try {
      await api.patch(
        `/admin-email/drafts/${id}/send`,
        {},
        authHeaders
      )

      alert("Draft sent")
      setActiveFolder("sent")
    } catch (err) {
      console.error(
        "❌ SEND DRAFT ERROR:",
        err.response?.data || err.message
      )

      alert(
        err.response?.data?.message ||
          "Draft could not be sent"
      )
    }
  }

  const openDraft = (email) => {
    setSelectedEmail(email)
    setTo(email.to || "")
    setCc(email.cc || "")
    setBcc(email.bcc || "")
    setSubject(email.subject || "")
    setMessage(email.message || "")
    setActiveFolder("compose")
  }

  if (loading) {
    return (
      <div style={loadingStyle}>
        <h2>Loading Email Center...</h2>
      </div>
    )
  }

  return (
    <div style={page}>
      <h1 style={title}>📧 Admin Email Center</h1>

      <div style={layout}>
        <aside style={sidebar}>
          <h3 style={sectionTitle}>Mailbox</h3>

          <div style={folderList}>
            {FOLDERS.map((folder) => (
              <button
                key={folder.id}
                type="button"
                onClick={() => setActiveFolder(folder.id)}
                style={{
                  ...folderButton,
                  background:
                    activeFolder === folder.id
                      ? "rgba(34,211,238,0.16)"
                      : "#111827",
                  border:
                    activeFolder === folder.id
                      ? "1px solid #22d3ee"
                      : "1px solid #334155",
                  color:
                    activeFolder === folder.id
                      ? "#22d3ee"
                      : "#cbd5e1"
                }}
              >
                {folder.label}
              </button>
            ))}
          </div>

          <h3 style={customerTitle}>Customers</h3>

          {customers.map((customer) => (
            <button
              key={customer._id}
              type="button"
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
                {customer.name ||
                  customer.customerName ||
                  "Customer"}
              </strong>

              <span style={emailStyle}>
                {customer.email}
              </span>
            </button>
          ))}
        </aside>

        <main style={mainPanel}>
          {activeFolder === "compose" ? (
            <>
              <h2 style={sectionTitle}>✍️ Compose Email</h2>

              <div style={field}>
                <label style={label}>Templates</label>

                <div style={templateGrid}>
                  {templates.map((template) => (
                    <button
                      key={template.name}
                      type="button"
                      onClick={() => applyTemplate(template)}
                      style={templateButton}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>

              <div style={field}>
                <label style={label}>To</label>

                <input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  style={input}
                />
              </div>

              <div style={twoCol}>
                <div style={field}>
                  <label style={label}>CC</label>

                  <input
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    placeholder="Optional"
                    style={input}
                  />
                </div>

                <div style={field}>
                  <label style={label}>BCC</label>

                  <input
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    placeholder="Optional"
                    style={input}
                  />
                </div>
              </div>

              <div style={field}>
                <label style={label}>Subject</label>

                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={input}
                />
              </div>

              <div style={field}>
                <label style={label}>Message</label>

                <textarea
                  rows={12}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={textarea}
                />
              </div>

              <label style={attachLabel}>
                📎 Attach Files

                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setAttachments(Array.from(e.target.files || []))
                  }
                  style={{ display: "none" }}
                />
              </label>

              {attachments.length > 0 && (
                <div style={attachmentBox}>
                  {attachments.map((file) => (
                    <p key={file.name} style={attachmentName}>
                      {file.name}
                    </p>
                  ))}
                </div>
              )}

              <div style={composeActions}>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending}
                  style={sendButton}
                >
                  {sending ? "Sending..." : "Send Email"}
                </button>

                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={savingDraft}
                  style={draftButton}
                >
                  {savingDraft ? "Saving..." : "Save Draft"}
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 style={sectionTitle}>
                {FOLDERS.find((f) => f.id === activeFolder)?.label}
              </h2>

              {folderLoading ? (
                <p>Loading emails...</p>
              ) : emails.length === 0 ? (
                <div style={emptyCard}>
                  <h3>No emails here yet</h3>

                  <p>
                    This folder will update as you send,
                    save, or archive emails.
                  </p>
                </div>
              ) : (
                <>
                  <EmailThread
                    emails={emails}
                    selectedEmail={selectedEmail}
                    onSelectEmail={setSelectedEmail}
                    onArchive={archiveEmail}
                    onRestore={restoreEmail}
                    onReply={handleReply}
                  />

                  {activeFolder === "drafts" && (
                    <div style={draftActionsBox}>
                      <p style={draftHint}>
                        Select a draft from the list, then edit or send it below.
                      </p>

                      {selectedEmail && (
                        <div style={cardActions}>
                          <button
                            type="button"
                            onClick={() => openDraft(selectedEmail)}
                            style={smallButton}
                          >
                            Edit Draft
                          </button>

                          <button
                            type="button"
                            onClick={() => sendDraft(selectedEmail._id)}
                            style={sendSmallButton}
                          >
                            Send Draft
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
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
  gridTemplateColumns: "300px 1fr",
  gap: 24
}

const sidebar = {
  background: "#0f172a",
  borderRadius: 16,
  padding: 20,
  border: "1px solid #1e293b",
  height: "82vh",
  overflowY: "auto"
}

const mainPanel = {
  background: "#0f172a",
  borderRadius: 16,
  padding: 24,
  border: "1px solid #1e293b",
  minHeight: "82vh"
}

const sectionTitle = {
  marginTop: 0,
  marginBottom: 20
}

const folderList = {
  display: "grid",
  gap: 10,
  marginBottom: 24
}

const folderButton = {
  padding: "12px 14px",
  borderRadius: 10,
  fontWeight: 800,
  cursor: "pointer",
  textAlign: "left"
}

const customerTitle = {
  marginTop: 28,
  marginBottom: 14
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

const twoCol = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16
}

const label = {
  display: "block",
  marginBottom: 8,
  fontWeight: 700
}

const input = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#020617",
  color: "#fff",
  boxSizing: "border-box"
}

const textarea = {
  ...input,
  resize: "vertical"
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

const attachLabel = {
  display: "inline-block",
  background: "#f97316",
  color: "#020617",
  padding: "12px 14px",
  borderRadius: 12,
  fontWeight: 900,
  cursor: "pointer"
}

const attachmentBox = {
  marginTop: 12,
  background: "#020617",
  border: "1px solid #334155",
  borderRadius: 12,
  padding: 12
}

const attachmentName = {
  margin: "4px 0",
  color: "#cbd5e1"
}

const composeActions = {
  display: "flex",
  gap: 12,
  marginTop: 20,
  flexWrap: "wrap"
}

const sendButton = {
  padding: "14px 18px",
  borderRadius: 10,
  border: "none",
  background: "#22c55e",
  color: "#020617",
  fontWeight: 900,
  cursor: "pointer"
}

const draftButton = {
  padding: "14px 18px",
  borderRadius: 10,
  border: "none",
  background: "#a78bfa",
  color: "#020617",
  fontWeight: 900,
  cursor: "pointer"
}

const emptyCard = {
  background: "#111827",
  border: "1px solid #334155",
  borderRadius: 14,
  padding: 20
}

const cardActions = {
  display: "flex",
  gap: 10,
  marginTop: 14,
  flexWrap: "wrap"
}

const smallButton = {
  border: "none",
  background: "#38bdf8",
  color: "#020617",
  borderRadius: 8,
  padding: "8px 12px",
  fontWeight: 900,
  cursor: "pointer"
}

const sendSmallButton = {
  ...smallButton,
  background: "#22c55e"
}

const draftActionsBox = {
  marginTop: 18,
  background: "#111827",
  border: "1px solid #334155",
  borderRadius: 14,
  padding: 16
}

const draftHint = {
  color: "#94a3b8",
  margin: 0
}