import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react"

import {
  useNavigate,
  useParams
} from "react-router-dom"

import toast from "react-hot-toast"

import api from "../../services/api"
import MessageBubble from "../../components/admin/MessageBubble"

const getCustomerEmail = () => {
  let email = ""

  const customerUser =
    localStorage.getItem("customerUser")

  if (customerUser) {
    try {
      email =
        JSON.parse(customerUser)?.email || ""
    } catch (err) {
      console.error(
        "❌ CUSTOMER USER PARSE ERROR:",
        err
      )
    }
  }

  if (!email) {
    email =
      localStorage.getItem("customerEmail") || ""
  }

  return email.trim().toLowerCase()
}

export default function CustomerSupport() {
  const navigate = useNavigate()
  const { id } = useParams()

  const threadRef = useRef(null)

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

      const allTickets =
        res.data?.data || []

      const myTickets =
        allTickets.filter(
          (ticket) =>
            String(ticket.email || "")
              .trim()
              .toLowerCase() === email
        )

      setTickets(myTickets)

      if (id) {
        const found =
          myTickets.find(
            (ticket) =>
              ticket._id === id
          )

        setSelected(
          found ||
            myTickets[0] ||
            null
        )
      } else {
        setSelected((prev) => {
          if (!prev) {
            return (
              myTickets[0] || null
            )
          }

          return (
            myTickets.find(
              (ticket) =>
                ticket._id === prev._id
            ) ||
            myTickets[0] ||
            null
          )
        })
      }
    } catch (err) {
      console.error(
        "❌ SUPPORT LOAD ERROR:",
        err
      )

      toast.error(
        "Failed to load support tickets"
      )
    } finally {
      setLoading(false)
    }
  }, [id])

  /* ================= FIX ESLINT WARNING ================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTickets()
    }, 0)

    return () => clearTimeout(timer)
  }, [loadTickets])

  /* ================= AUTO SCROLL ================= */

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop =
        threadRef.current.scrollHeight
    }
  }, [selected])

  const sendReply = async () => {
    if (!reply.trim()) return
    if (!selected?._id) return

    try {
      setSending(true)

      await api.post(
        `/support/${selected._id}/reply`,
        {
          sender: "customer",
          message: reply.trim()
        }
      )

      const newReply = {
        sender: "customer",
        message: reply.trim(),
        createdAt:
          new Date().toISOString()
      }

      const updatedTicket = {
        ...selected,
        replies: [
          ...(selected.replies ||
            []),
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

      toast.success(
        "Reply sent successfully"
      )

      await loadTickets()
    } catch (err) {
      console.error(
        "❌ REPLY ERROR:",
        err
      )

      toast.error(
        "Could not send reply"
      )
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        Loading support...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              Customer Support
            </p>

            <h1 className="text-4xl font-extrabold">
              Support Center
            </h1>

            <p className="mt-2 text-slate-400">
              View and reply to support conversations.
            </p>
          </div>

          <button
  type="button"
  onClick={() =>
    navigate("/support")
  }
  className="rounded-full bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
>
  + New Ticket
</button>

        </div>

        <div className="mb-5 text-sm text-slate-400">
          {tickets.length} ticket(s)
        </div>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">

          <aside className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/20">

            <h2 className="mb-5 text-xl font-bold">
              My Tickets
            </h2>

            {tickets.length === 0 && (
              <div className="rounded-2xl border border-slate-800 bg-[#020617] p-5 text-center">
                <p className="text-slate-400">
                  No support tickets found.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {tickets.map((ticket) => (
                <button
                  key={ticket._id}
                  type="button"
                  onClick={() =>
                    setSelected(ticket)
                  }
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selected?._id ===
                    ticket._id
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-slate-800 bg-[#020617] hover:border-slate-600"
                  }`}
                >
                  <p className="font-bold">
                    {ticket.subject ||
                      "Support Ticket"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Status:{" "}
                    {ticket.status ||
                      "open"}
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {ticket.createdAt?.slice(
                      0,
                      10
                    )}
                  </p>
                </button>
              ))}
            </div>

          </aside>

          <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">

            {!selected ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold">
                    Select a Ticket
                  </h2>

                  <p className="mt-2 text-slate-500">
                    Choose a support ticket
                    from the left panel.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-5 border-b border-slate-800 pb-4">
                  <h2 className="text-2xl font-bold">
                    {selected.subject ||
                      "Support Ticket"}
                  </h2>

                  <p className="mt-2 text-emerald-400">
                    Status:{" "}
                    {selected.status ||
                      "open"}
                  </p>
                </div>

                <div
                  ref={threadRef}
                  className="mb-5 flex max-h-[55vh] flex-col gap-4 overflow-y-auto rounded-2xl border border-slate-800 bg-[#020617] p-4"
                >
                  <MessageBubble
                    message={{
                      sender:
                        "customer",
                      message:
                        selected.message,
                      createdAt:
                        selected.createdAt
                    }}
                  />

                  {selected.replies?.map(
                    (
                      item,
                      index
                    ) => (
                      <MessageBubble
                        key={`${item.createdAt || index}-${index}`}
                        message={item}
                      />
                    )
                  )}
                </div>

                <textarea
                  rows={5}
                  value={reply}
                  onChange={(e) =>
                    setReply(
                      e.target.value
                    )
                  }
                  placeholder="Type your reply..."
                  className="mb-4 w-full rounded-2xl border border-slate-700 bg-[#020617] p-4 text-white outline-none focus:border-cyan-400"
                />

                <button
                  type="button"
                  onClick={sendReply}
                  disabled={
                    sending ||
                    !reply.trim()
                  }
                  className="rounded-2xl bg-emerald-500 px-5 py-3 font-bold text-black transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  {sending
                    ? "Sending..."
                    : "Send Reply"}
                </button>
              </>
            )}
          </section>

        </div>
      </section>
    </main>
  )
}