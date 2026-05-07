import { useEffect, useState } from "react"
import api from "../../services/api"

export default function AdminSupport() {

  const [tickets, setTickets] =
    useState([])

  const [selected, setSelected] =
    useState(null)

  const [reply, setReply] =
    useState("")

  const [filter, setFilter] =
    useState("open")

  /* ================= LOAD ================= */

  const loadTickets = async () => {

    try {

      const res =
        await api.get("/support")

      setTickets(
        res.data?.data || []
      )

    } catch (err) {

      console.error(
        "❌ SUPPORT LOAD ERROR:",
        err
      )
    }
  }

  /* ================= FIXED EFFECT ================= */

  useEffect(() => {

    const init = async () => {

      await loadTickets()

    }

    init()

  }, [])

  /* ================= REPLY ================= */

  const sendReply = async () => {

    if (!reply.trim()) return

    if (!selected?._id) return

    try {

      await api.post(
        `/support/${selected._id}/reply`,
        {
          message: reply
        }
      )

      setReply("")

      await loadTickets()

      const updated =
        await api.get(
          `/support`
        )

      const fresh =
        updated.data?.data?.find(
          t => t._id === selected._id
        )

      setSelected(fresh)

    } catch (err) {

      console.error(
        "❌ REPLY ERROR:",
        err
      )
    }
  }

  /* ================= ARCHIVE ================= */

  const archiveTicket = async (id) => {

    try {

      await api.patch(
        `/support/${id}/archive`
      )

      await loadTickets()

      setSelected(null)

    } catch (err) {

      console.error(
        "❌ ARCHIVE ERROR:",
        err
      )
    }
  }

  /* ================= FILTER ================= */

  const filtered =
    tickets.filter(ticket => {

      if (filter === "archived") {
        return ticket.archived
      }

      if (filter === "all") {
        return true
      }

      return !ticket.archived
    })

  return (
    <div style={page}>

      <h1 style={title}>
        🛟 Support Center
      </h1>

      <div style={layout}>

        {/* ================= SIDEBAR ================= */}

        <div style={sidebar}>

          <div style={filterRow}>

            <button
              onClick={() =>
                setFilter("open")
              }
              style={filterBtn}
            >
              Open
            </button>

            <button
              onClick={() =>
                setFilter("archived")
              }
              style={filterBtn}
            >
              Archived
            </button>

            <button
              onClick={() =>
                setFilter("all")
              }
              style={filterBtn}
            >
              All
            </button>

          </div>

          {filtered.map(ticket => (

            <button
              key={ticket._id}

              onClick={() =>
                setSelected(ticket)
              }

              style={ticketBtn}
            >

              <strong>
                {ticket.customerName}
              </strong>

              <div>
                {ticket.subject}
              </div>

              <small>
                {ticket.email}
              </small>

            </button>

          ))}

        </div>

        {/* ================= MAIN ================= */}

        <div style={main}>

          {!selected && (

            <h2>
              Select Ticket
            </h2>
          )}

          {selected && (
            <>

              {/* HEADER */}

              <div style={ticketHeader}>

                <div>

                  <h2>
                    {selected.subject}
                  </h2>

                  <p>
                    {selected.customerName}
                  </p>

                  <p>
                    {selected.email}
                  </p>

                  {selected.orderNumber && (
                    <p>
                      Order:
                      {" "}
                      {selected.orderNumber}
                    </p>
                  )}

                </div>

                {!selected.archived && (

                  <button
                    onClick={() =>
                      archiveTicket(
                        selected._id
                      )
                    }

                    style={archiveBtn}
                  >
                    Archive
                  </button>

                )}

              </div>

              {/* THREAD */}

              <div style={thread}>

                <div style={bubbleCustomer}>
                  {selected.message}
                </div>

                {selected.replies?.map(
                  (reply, index) => (

                    <div
                      key={index}

                      style={
                        reply.sender === "admin"
                          ? bubbleAdmin
                          : bubbleCustomer
                      }
                    >
                      {reply.message}
                    </div>
                  )
                )}

              </div>

              {/* REPLY */}

              {!selected.archived && (
                <>
                  <textarea
                    rows={5}

                    value={reply}

                    onChange={(e) =>
                      setReply(
                        e.target.value
                      )
                    }

                    style={textarea}

                    placeholder="Reply to customer..."
                  />

                  <button
                    onClick={sendReply}

                    style={sendBtn}
                  >
                    Send Reply
                  </button>
                </>
              )}

            </>
          )}

        </div>

      </div>

    </div>
  )
}

/* ================= STYLES ================= */

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

  gridTemplateColumns:
    "320px 1fr",

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

const filterRow = {

  display: "flex",

  gap: 10,

  marginBottom: 20
}

const filterBtn = {

  padding: "8px 12px",

  borderRadius: 8,

  border: "none",

  background: "#111827",

  color: "white",

  cursor: "pointer"
}

const ticketBtn = {

  width: "100%",

  textAlign: "left",

  padding: 14,

  borderRadius: 10,

  background: "#111827",

  border:
    "1px solid #1e293b",

  color: "white",

  marginBottom: 12,

  cursor: "pointer"
}

const ticketHeader = {

  display: "flex",

  justifyContent: "space-between",

  marginBottom: 20
}

const archiveBtn = {

  background: "#f59e0b",

  border: "none",

  color: "white",

  padding: "10px 14px",

  borderRadius: 8,

  cursor: "pointer"
}

const thread = {

  display: "flex",

  flexDirection: "column",

  gap: 14,

  marginBottom: 20
}

const bubbleCustomer = {

  background: "#111827",

  padding: 14,

  borderRadius: 12,

  maxWidth: "80%"
}

const bubbleAdmin = {

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

  border:
    "1px solid #334155",

  color: "white",

  marginBottom: 14
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