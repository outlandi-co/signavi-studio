import { useEffect, useMemo, useState } from "react"
import api from "../../services/api"
import socket from "../../services/socket"

export default function AdminSupport() {
  const [tickets, setTickets] = useState([])
  const [selected, setSelected] = useState(null)
  const [reply, setReply] = useState("")
  const [filter, setFilter] = useState("open")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  /* ================= LOAD ================= */

  const loadTickets = async () => {
    try {
      setLoading(true)

      const res = await api.get("/support")
      const data = res.data?.data || []

      setTickets(data)

      setSelected(prev => {
        if (!prev) return null

        return data.find(ticket => ticket._id === prev._id) || null
      })
    } catch (err) {
      console.error("❌ SUPPORT LOAD ERROR:", err)
    } finally {
      setLoading(false)
    }
  }

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
  const timer = setTimeout(() => {
    loadTickets()
  }, 0)

  return () => clearTimeout(timer)
}, [])

  /* ================= SOCKET UPDATES ================= */

  useEffect(() => {
    const handleTicketUpdate = updatedTicket => {
      if (!updatedTicket?._id) return

      setTickets(prev => {
        const exists = prev.some(ticket => ticket._id === updatedTicket._id)

        const next = exists
          ? prev.map(ticket =>
              ticket._id === updatedTicket._id ? updatedTicket : ticket
            )
          : [updatedTicket, ...prev]

        return next.sort(
          (a, b) =>
            new Date(b.lastMessageAt || b.updatedAt || b.createdAt) -
            new Date(a.lastMessageAt || a.updatedAt || a.createdAt)
        )
      })

      setSelected(prev =>
        prev?._id === updatedTicket._id ? updatedTicket : prev
      )
    }

    const handleNewMessage = data => {
      if (data?.ticket) {
        handleTicketUpdate(data.ticket)
      } else {
        loadTickets()
      }
    }

    socket.on("support:ticket-updated", handleTicketUpdate)
    socket.on("support:new-message", handleNewMessage)

    return () => {
      socket.off("support:ticket-updated", handleTicketUpdate)
      socket.off("support:new-message", handleNewMessage)
    }
  }, [])

  /* ================= SELECT / READ ================= */

  const selectTicket = async ticket => {
    setSelected(ticket)

    if (!ticket?._id) return

    try {
      const res = await api.patch(`/support/${ticket._id}/read`, {
        reader: "admin"
      })

      const updatedTicket = res.data?.data

      if (updatedTicket) {
        setTickets(prev =>
          prev.map(item =>
            item._id === updatedTicket._id ? updatedTicket : item
          )
        )

        setSelected(updatedTicket)
      }
    } catch (err) {
      console.error("❌ MARK READ ERROR:", err)
    }
  }

  /* ================= REPLY ================= */

  const sendReply = async () => {
    if (!reply.trim()) return
    if (!selected?._id) return
    if (selected.archived) return
    if (selected.status === "closed") return

    try {
      setSending(true)

      const res = await api.post(`/support/${selected._id}/reply`, {
        sender: "admin",
        message: reply.trim()
      })

      const updatedTicket = res.data?.data

      if (updatedTicket) {
        setSelected(updatedTicket)

        setTickets(prev =>
          prev.map(ticket =>
            ticket._id === updatedTicket._id ? updatedTicket : ticket
          )
        )
      }

      setReply("")
    } catch (err) {
      console.error("❌ REPLY ERROR:", err)
    } finally {
      setSending(false)
    }
  }

  /* ================= CLOSE ================= */

  const closeTicket = async id => {
    try {
      const res = await api.patch(`/support/${id}/close`)
      const updatedTicket = res.data?.data

      if (updatedTicket) {
        setSelected(updatedTicket)

        setTickets(prev =>
          prev.map(ticket =>
            ticket._id === updatedTicket._id ? updatedTicket : ticket
          )
        )
      }
    } catch (err) {
      console.error("❌ CLOSE ERROR:", err)
    }
  }

  /* ================= REOPEN ================= */

  const reopenTicket = async id => {
    try {
      const res = await api.patch(`/support/${id}/reopen`)
      const updatedTicket = res.data?.data

      if (updatedTicket) {
        setSelected(updatedTicket)
        setFilter("open")

        setTickets(prev =>
          prev.map(ticket =>
            ticket._id === updatedTicket._id ? updatedTicket : ticket
          )
        )
      }
    } catch (err) {
      console.error("❌ REOPEN ERROR:", err)
    }
  }

  /* ================= ARCHIVE ================= */

  const archiveTicket = async id => {
    try {
      const res = await api.patch(`/support/${id}/archive`)
      const updatedTicket = res.data?.data

      if (updatedTicket) {
        setSelected(updatedTicket)
        setFilter("archived")

        setTickets(prev =>
          prev.map(ticket =>
            ticket._id === updatedTicket._id ? updatedTicket : ticket
          )
        )
      }
    } catch (err) {
      console.error("❌ ARCHIVE ERROR:", err)
    }
  }

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    return tickets.filter(ticket => {
      if (filter === "archived") {
        return ticket.archived
      }

      if (filter === "closed") {
        return !ticket.archived && ticket.status === "closed"
      }

      if (filter === "all") {
        return true
      }

      return !ticket.archived && ticket.status !== "closed"
    })
  }, [tickets, filter])

  const messages = selected
    ? [
        {
          sender: "customer",
          message: selected.message,
          createdAt: selected.createdAt
        },
        ...(selected.replies || [])
      ]
    : []

  const totalUnread = tickets.reduce(
    (sum, ticket) => sum + Number(ticket.unreadAdminCount || 0),
    0
  )

  return (
    <div style={page}>
      <div style={topBar}>
        <div>
          <h1 style={title}>🛟 Support Center</h1>
          <p style={subtitle}>
            Manage customer conversations, unread replies, closed chats, and archived tickets.
          </p>
        </div>

        {totalUnread > 0 && (
          <div style={globalBadge}>
            {totalUnread} unread
          </div>
        )}
      </div>

      <div style={layout}>
        {/* ================= SIDEBAR ================= */}

        <aside style={sidebar}>
          <div style={filterRow}>
            <FilterButton active={filter === "open"} onClick={() => setFilter("open")}>
              Open
            </FilterButton>

            <FilterButton active={filter === "closed"} onClick={() => setFilter("closed")}>
              Closed
            </FilterButton>

            <FilterButton active={filter === "archived"} onClick={() => setFilter("archived")}>
              Archived
            </FilterButton>

            <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
              All
            </FilterButton>
          </div>

          {loading && (
            <div style={emptyState}>
              Loading support tickets...
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={emptyState}>
              No {filter} tickets.
            </div>
          )}

          {!loading &&
            filtered.map(ticket => {
              const unread = Number(ticket.unreadAdminCount || 0)
              const isSelected = selected?._id === ticket._id

              return (
                <button
                  key={ticket._id}
                  onClick={() => selectTicket(ticket)}
                  style={{
                    ...ticketBtn,
                    ...(isSelected ? ticketBtnSelected : {}),
                    ...(unread > 0 ? ticketBtnUnread : {})
                  }}
                >
                  <div style={ticketTop}>
                    <strong style={ticketName}>
                      {ticket.customerName || "Customer"}
                    </strong>

                    {unread > 0 && (
                      <span style={unreadBadge}>
                        {unread}
                      </span>
                    )}
                  </div>

                  <div style={ticketSubject}>
                    {ticket.subject || "Support Ticket"}
                  </div>

                  <div style={ticketPreview}>
                    {ticket.lastMessage || ticket.message || "No message yet"}
                  </div>

                  <div style={ticketMeta}>
                    <small>{ticket.email || "No email"}</small>
                    <small>{formatTime(ticket.lastMessageAt || ticket.updatedAt)}</small>
                  </div>

                  <span style={getStatusStyle(ticket)}>
                    {ticket.archived
                      ? "Archived"
                      : ticket.status === "closed"
                        ? "Closed"
                        : "Open"}
                  </span>
                </button>
              )
            })}
        </aside>

        {/* ================= MAIN ================= */}

        <main style={main}>
          {!selected && (
            <div style={emptyMain}>
              <h2>Select a ticket</h2>
              <p>Choose a support conversation from the sidebar.</p>
            </div>
          )}

          {selected && (
            <>
              {/* HEADER */}

              <div style={ticketHeader}>
                <div>
                  <h2 style={chatTitle}>
                    {selected.subject || "Support Conversation"}
                  </h2>

                  <p style={chatMeta}>
                    {selected.customerName || "Customer"} • {selected.email}
                  </p>

                  {selected.orderNumber && (
                    <p style={chatMeta}>
                      Order: {selected.orderNumber}
                    </p>
                  )}
                </div>

                <div style={actionRow}>
                  {!selected.archived && selected.status !== "closed" && (
                    <button
                      onClick={() => closeTicket(selected._id)}
                      style={closeBtn}
                    >
                      Close Chat
                    </button>
                  )}

                  {!selected.archived && selected.status === "closed" && (
                    <>
                      <button
                        onClick={() => reopenTicket(selected._id)}
                        style={reopenBtn}
                      >
                        Reopen
                      </button>

                      <button
                        onClick={() => archiveTicket(selected._id)}
                        style={archiveBtn}
                      >
                        Archive
                      </button>
                    </>
                  )}

                  {selected.archived && (
                    <button
                      onClick={() => reopenTicket(selected._id)}
                      style={reopenBtn}
                    >
                      Restore / Reopen
                    </button>
                  )}
                </div>
              </div>

              {/* THREAD */}

              <div style={thread}>
                {messages.map((message, index) => {
                  const isAdmin = message.sender === "admin"

                  return (
                    <div
                      key={`${message.createdAt}-${index}`}
                      style={{
                        ...bubble,
                        ...(isAdmin ? bubbleAdmin : bubbleCustomer)
                      }}
                    >
                      <div style={bubbleLabel}>
                        {isAdmin ? "Admin" : "Customer"}
                      </div>

                      <div>
                        {message.message}
                      </div>

                      {message.createdAt && (
                        <div style={bubbleTime}>
                          {new Date(message.createdAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* REPLY */}

              <div style={replyPanel}>
                {selected.archived ? (
                  <div style={lockedBox}>
                    This conversation is archived. Reopen it to reply.
                  </div>
                ) : selected.status === "closed" ? (
                  <div style={lockedBox}>
                    This chat is closed. Reopen it before replying.
                  </div>
                ) : (
                  <>
                    <textarea
                      rows={5}
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      style={textarea}
                      placeholder="Reply to customer..."
                    />

                    <button
                      onClick={sendReply}
                      disabled={sending || !reply.trim()}
                      style={{
                        ...sendBtn,
                        ...(sending || !reply.trim() ? disabledBtn : {})
                      }}
                    >
                      {sending ? "Sending..." : "Send Reply"}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

/* ================= HELPERS ================= */

function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...filterBtn,
        ...(active ? filterBtnActive : {})
      }}
    >
      {children}
    </button>
  )
}

function formatTime(date) {
  if (!date) return ""

  const value = new Date(date)
  const now = new Date()
  const diffMs = now - value
  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(minutes / 60)

  if (minutes < 1) return "Now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`

  return value.toLocaleDateString()
}

function getStatusStyle(ticket) {
  if (ticket.archived) {
    return {
      ...statusPill,
      background: "#334155",
      color: "#cbd5e1"
    }
  }

  if (ticket.status === "closed") {
    return {
      ...statusPill,
      background: "#064e3b",
      color: "#bbf7d0"
    }
  }

  return {
    ...statusPill,
    background: "#1d4ed8",
    color: "#dbeafe"
  }
}

/* ================= STYLES ================= */

const page = {
  padding: 30,
  background: "#020617",
  color: "white",
  minHeight: "100vh"
}

const topBar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  marginBottom: 20
}

const title = {
  margin: 0
}

const subtitle = {
  margin: "8px 0 0",
  color: "#94a3b8"
}

const globalBadge = {
  background: "#dc2626",
  color: "white",
  padding: "8px 14px",
  borderRadius: 999,
  fontWeight: "bold"
}

const layout = {
  display: "grid",
  gridTemplateColumns: "360px 1fr",
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
  padding: 20,
  minHeight: "80vh",
  display: "flex",
  flexDirection: "column"
}

const filterRow = {
  display: "flex",
  gap: 8,
  marginBottom: 20,
  flexWrap: "wrap"
}

const filterBtn = {
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid #334155",
  background: "#111827",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold"
}

const filterBtnActive = {
  background: "#2563eb",
  borderColor: "#60a5fa"
}

const emptyState = {
  color: "#94a3b8",
  padding: 16
}

const ticketBtn = {
  width: "100%",
  textAlign: "left",
  padding: 14,
  borderRadius: 12,
  background: "#111827",
  border: "1px solid #1e293b",
  color: "white",
  marginBottom: 12,
  cursor: "pointer",
  transition: "0.2s ease"
}

const ticketBtnSelected = {
  borderColor: "#60a5fa",
  background: "#172554"
}

const ticketBtnUnread = {
  borderColor: "#ef4444",
  boxShadow: "0 0 0 1px rgba(239,68,68,0.35)"
}

const ticketTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10
}

const ticketName = {
  fontSize: 15
}

const unreadBadge = {
  minWidth: 24,
  height: 24,
  padding: "0 8px",
  background: "#dc2626",
  color: "white",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: "bold",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center"
}

const ticketSubject = {
  marginTop: 6,
  fontWeight: "bold",
  color: "#e2e8f0"
}

const ticketPreview = {
  marginTop: 6,
  color: "#94a3b8",
  fontSize: 13,
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical"
}

const ticketMeta = {
  marginTop: 10,
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  color: "#64748b"
}

const statusPill = {
  display: "inline-block",
  marginTop: 10,
  padding: "4px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: "bold",
  textTransform: "uppercase"
}

const emptyMain = {
  margin: "auto",
  textAlign: "center",
  color: "#94a3b8"
}

const ticketHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 20,
  borderBottom: "1px solid #1e293b",
  paddingBottom: 18,
  marginBottom: 18
}

const chatTitle = {
  margin: 0
}

const chatMeta = {
  margin: "6px 0 0",
  color: "#94a3b8"
}

const actionRow = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  justifyContent: "flex-end"
}

const closeBtn = {
  background: "#16a34a",
  border: "none",
  color: "white",
  padding: "10px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold"
}

const reopenBtn = {
  background: "#2563eb",
  border: "none",
  color: "white",
  padding: "10px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold"
}

const archiveBtn = {
  background: "#f59e0b",
  border: "none",
  color: "white",
  padding: "10px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold"
}

const thread = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 14,
  overflowY: "auto",
  paddingRight: 8,
  marginBottom: 20
}

const bubble = {
  padding: 14,
  borderRadius: 14,
  maxWidth: "80%",
  lineHeight: 1.45,
  whiteSpace: "pre-wrap"
}

const bubbleCustomer = {
  background: "#111827",
  alignSelf: "flex-start",
  border: "1px solid #1e293b"
}

const bubbleAdmin = {
  background: "#2563eb",
  alignSelf: "flex-end"
}

const bubbleLabel = {
  fontSize: 11,
  fontWeight: "bold",
  textTransform: "uppercase",
  opacity: 0.7,
  marginBottom: 6
}

const bubbleTime = {
  marginTop: 8,
  fontSize: 11,
  opacity: 0.55
}

const replyPanel = {
  borderTop: "1px solid #1e293b",
  paddingTop: 16
}

const textarea = {
  width: "100%",
  padding: 14,
  borderRadius: 10,
  background: "#020617",
  border: "1px solid #334155",
  color: "white",
  marginBottom: 14,
  resize: "vertical"
}

const sendBtn = {
  background: "#22c55e",
  border: "none",
  padding: "12px 18px",
  borderRadius: 10,
  color: "white",
  fontWeight: "bold",
  cursor: "pointer"
}

const disabledBtn = {
  background: "#475569",
  cursor: "not-allowed"
}

const lockedBox = {
  background: "#111827",
  border: "1px solid #334155",
  borderRadius: 12,
  padding: 16,
  color: "#cbd5e1",
  fontWeight: "bold"
}