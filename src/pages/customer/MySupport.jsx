import {
  useEffect,
  useState
} from "react"

import api from "../../services/api"

export default function MySupport() {

  const [tickets, setTickets] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  /* ================= LOAD ================= */

  useEffect(() => {

    const loadTickets =
      async () => {

        try {

          const customerUser =
            JSON.parse(
              localStorage.getItem(
                "customerUser"
              )
            )

          const email =
            customerUser?.email

          if (!email) {

            console.warn(
              "❌ No customer email"
            )

            return
          }

          console.log(
            "📧 CUSTOMER SUPPORT EMAIL:",
            email
          )

          const res =
            await api.get(
              `/support?email=${email}`
            )

          console.log(
            "🛟 CUSTOMER TICKETS:",
            res.data
          )

          setTickets(
            res.data.data || []
          )

        } catch (err) {

          console.error(
            "❌ LOAD SUPPORT ERROR:",
            err
          )

        } finally {

          setLoading(false)
        }
      }

    loadTickets()

  }, [])

  /* ================= LOADING ================= */

  if (loading) {

    return (
      <div>
        Loading support...
      </div>
    )
  }

  return (

    <div>

      <h2>
        My Support Tickets
      </h2>

      {tickets.length === 0 && (

        <p>
          No tickets found.
        </p>
      )}

      {tickets.map(ticket => (

        <div
          key={ticket._id}

          style={{
            padding: 16,
            marginBottom: 16,
            border: "1px solid #334155",
            borderRadius: 10
          }}
        >

          <h3>
            {ticket.subject}
          </h3>

          <p>
            {ticket.message}
          </p>

          <p>
            Status:
            {" "}
            {ticket.status}
          </p>

        </div>
      ))}
    </div>
  )
}