import {
  useEffect,
  useState
} from "react"

import api from "../../services/api"

export default function CustomerSupport() {

  const [tickets, setTickets] =
    useState([])

  const [selected, setSelected] =
    useState(null)

  const [reply, setReply] =
    useState("")

  const [loading, setLoading] =
    useState(true)

  /* ================= LOAD ================= */

  const loadTickets = async () => {

    try {

      let email = null

      const customerUser =
        localStorage.getItem(
          "customerUser"
        )

      if (customerUser) {

        try {

          email =
            JSON.parse(
              customerUser
            )?.email

        } catch (err) {

          console.error(
            "❌ PARSE ERROR:",
            err
          )
        }
      }

      if (!email) {

        email =
          localStorage.getItem(
            "customerEmail"
          )
      }

      if (!email) return

      const res =
        await api.get("/support")

      const allTickets =
        res.data?.data || []

      const myTickets =
        allTickets.filter(
          ticket =>
            ticket.email === email
        )

      setTickets(myTickets)

      if (myTickets.length > 0) {

        setSelected(
          myTickets[0]
        )
      }

    } catch (err) {

      console.error(
        "❌ LOAD SUPPORT ERROR:",
        err
      )

    } finally {

      setLoading(false)
    }
  }

  /* ================= EFFECT ================= */

useEffect(() => {

  const init = async () => {

    await loadTickets()
  }

  init()

}, [])
  /* ================= REPLY ================= */

  const sendReply =
    async () => {

      if (!reply.trim()) return

      if (!selected?._id) return

      try {

        await api.post(
          `/support/${selected._id}/reply`,
          {

            sender:
              "customer",

            message:
              reply
          }
        )

        console.log(
          "✅ CUSTOMER REPLY API HIT"
        )

        setReply("")

        await loadTickets()

        const updated =
          await api.get("/support")

        const fresh =
          updated.data?.data?.find(
            t =>
              t._id === selected._id
          )

        setSelected(fresh)

      } catch (err) {

        console.error(
          "❌ REPLY ERROR:",
          err
        )
      }
    }

  /* ================= LOADING ================= */

  if (loading) {

    return (

      <div style={loadingStyle}>
        Loading support...
      </div>
    )
  }

  /* ================= RENDER ================= */

  return (

    <div style={page}>

      <h1 style={title}>
        My Support
      </h1>

      <div style={layout}>

        {/* ================= SIDEBAR ================= */}

        <div style={sidebar}>

          {tickets.length === 0 && (

            <p style={{
              color: "#94a3b8"
            }}>
              No support tickets found.
            </p>
          )}

          {tickets.map(ticket => (

            <button
              key={ticket._id}

              onClick={() =>
                setSelected(ticket)
              }

              style={ticketBtn}
            >

              <strong>
                {ticket.subject}
              </strong>

              <div>
                Status:
                {" "}
                {ticket.status}
              </div>

              <small>
                {ticket.createdAt
                  ?.slice(0, 10)}
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

              <div style={header}>

                <div>

                  <h2>
                    {selected.subject}
                  </h2>

                  <p>
                    Ticket Status:
                    {" "}

                    <span style={{
                      color:
                        "#22c55e"
                    }}>
                      {selected.status}
                    </span>
                  </p>

                </div>

              </div>

              {/* THREAD */}

              <div style={thread}>

                <div style={customerBubble}>
                  {selected.message}
                </div>

                {selected.replies?.map(
                  (
                    item,
                    index
                  ) => (

                    <div
                      key={index}

                      style={
                        item.sender === "admin"
                          ? adminBubble
                          : customerBubble
                      }
                    >

                      {item.message}

                    </div>
                  )
                )}

              </div>

              {/* REPLY */}

              <textarea
                rows={5}

                value={reply}

                onChange={(e) =>
                  setReply(
                    e.target.value
                  )
                }

                placeholder="Reply to support..."

                style={textarea}
              />

              <button
                onClick={sendReply}

                style={sendBtn}
              >
                Send Reply
              </button>

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

const header = {

  marginBottom: 20
}

const thread = {

  display: "flex",

  flexDirection: "column",

  gap: 14,

  marginBottom: 20
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

const loadingStyle = {

  minHeight: "100vh",

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  background: "#020617",

  color: "white"
}