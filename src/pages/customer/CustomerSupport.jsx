import {
  useCallback,
  useEffect,
  useState
} from "react"

import {
  useParams
} from "react-router-dom"

import api from "../../services/api"

const getCustomerEmail = () => {
  let email = ""

  const customerUser =
    localStorage.getItem("customerUser")

  if (customerUser) {
    try {
      email =
        JSON.parse(customerUser)?.email || ""
    } catch (err) {
      console.error("❌ PARSE ERROR:", err)
    }
  }

  if (!email) {
    email =
      localStorage.getItem("customerEmail") || ""
  }

  return email.trim().toLowerCase()
}

export default function CustomerSupport() {
  const { id } = useParams()

  const [tickets, setTickets] = useState([])
  const [selected, setSelected] = useState(null)
  const [reply, setReply] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true)

      const email = getCustomerEmail()

      if (!email) {
        setTickets([])
        setSelected(null)
        return
      }

      const res = await api.get("/support")
      const allTickets = res.data?.data || []

      const myTickets = allTickets.filter(
        (ticket) =>
          String(ticket.email || "")
            .trim()
            .toLowerCase() === email
      )

      setTickets(myTickets)

      if (id) {
        const found = myTickets.find(
          (ticket) => ticket._id === id
        )

        setSelected(found || myTickets[0] || null)
      } else {
        setSelected(myTickets[0] || null)
      }
    } catch (err) {
      console.error("❌ LOAD SUPPORT ERROR:", err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTickets()
    }, 0)

    return () => clearTimeout(timer)
  }, [loadTickets])

  const sendReply = async () => {
    if (!reply.trim()) return
    if (!selected?._id) return

    try {
      setSending(true)

      await api.post(`/support/${selected._id}/reply`, {
        sender: "customer",
        message: reply.trim()
      })

      const newReply = {
        sender: "customer",
        message: reply.trim(),
        createdAt: new Date()
      }

      const updatedTicket = {
        ...selected,
        replies: [
          ...(selected.replies || []),
          newReply
        ]
      }

      setSelected(updatedTicket)

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id === selected._id
            ? updatedTicket
            : ticket
        )
      )

      setReply("")

      await loadTickets()
    } catch (err) {
      console.error("❌ REPLY ERROR:", err)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div style={loadingStyle}>
        Loading support...
      </div>
    )
  }

  return (
    <div style={page}>
      <h1 style={title}>
        Customer Support
      </h1>

      <div style={layout}>
        <div style={sidebar}>
          <h3 style={{ marginTop: 0 }}>
            My Tickets
          </h3>

          {tickets.length === 0 && (
            <p style={{ color: "#94a3b8" }}>
              No support tickets found.
            </p>
          )}

          {tickets.map((ticket) => (
            <button
              key={ticket._id}
              onClick={() => setSelected(ticket)}
              style={{
                ...ticketBtn,
                border:
                  selected?._id === ticket._id
                    ? "1px solid #06b6d4"
                    : "1px solid #1e293b"
              }}
            >
              <strong>
                {ticket.subject}
              </strong>

              <div>
                Status: {ticket.status}
              </div>

              <small>
                {ticket.createdAt?.slice(0, 10)}
              </small>
            </button>
          ))}
        </div>

        <div style={main}>
          {!selected && (
            <div>
              <h2>
                Select a ticket
              </h2>

              <p style={{ color: "#94a3b8" }}>
                Choose a support ticket to view the conversation.
              </p>
            </div>
          )}

          {selected && (
            <>
              <div style={header}>
                <h2>
                  {selected.subject}
                </h2>

                <div style={{ color: "#22c55e" }}>
                  Status: {selected.status}
                </div>
              </div>

              <div style={thread}>
                <div style={customerBubble}>
                  {selected.message}
                </div>

                {selected.replies?.map((item, index) => (
                  <div
                    key={index}
                    style={
                      item.sender === "admin"
                        ? adminBubble
                        : customerBubble
                    }
                  >
                    <div>
                      {item.message}
                    </div>

                    {item.createdAt && (
                      <small style={{ opacity: 0.7 }}>
                        {new Date(item.createdAt).toLocaleString()}
                      </small>
                    )}
                  </div>
                ))}
              </div>

              <textarea
                rows={5}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply..."
                style={textarea}
              />

              <button
                onClick={sendReply}
                disabled={sending}
                style={{
                  ...sendBtn,
                  opacity: sending ? 0.6 : 1,
                  cursor: sending ? "not-allowed" : "pointer"
                }}
              >
                {sending ? "Sending..." : "Send Reply"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const page = {
  padding: 30,
  background: "#020617",
  color: "white",
  minHeight: "100vh"
}

const title = {
  marginBottom: 20
}

const layout = {
  display: "grid",
  gridTemplateColumns: "320px 1fr",
  gap: 20
}

const sidebar = {
  background: "#0f172a",
  borderRadius: 12,
  padding: 20,
  height: "80vh",
  overflowY: "auto"
}

const main = {
  background: "#0f172a",
  borderRadius: 12,
  padding: 20
}

const ticketBtn = {
  width: "100%",
  textAlign: "left",
  padding: 14,
  borderRadius: 10,
  background: "#111827",
  color: "white",
  marginBottom: 12,
  cursor: "pointer"
}

const header = {
  marginBottom: 20
}

const thread = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  marginBottom: 20,
  maxHeight: "55vh",
  overflowY: "auto"
}

const customerBubble = {
  background: "#111827",
  padding: 14,
  borderRadius: 12,
  maxWidth: "80%"
}

const adminBubble = {
  background: "#2563eb",
  padding: 14,
  borderRadius: 12,
  alignSelf: "flex-end",
  maxWidth: "80%"
}

const textarea = {
  width: "100%",
  padding: 14,
  borderRadius: 10,
  background: "#020617",
  border: "1px solid #334155",
  color: "white",
  marginBottom: 14
}

const sendBtn = {
  background: "#22c55e",
  border: "none",
  padding: "12px 18px",
  borderRadius: 10,
  color: "white",
  fontWeight: "bold"
}

const loadingStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#020617",
  color: "white"
}