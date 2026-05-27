import {
  useEffect,
  useMemo,
  useState
} from "react"

import {
  useNavigate
} from "react-router-dom"

import toast from "react-hot-toast"

import api from "../../services/api"

const getCustomerEmail = () => {
  let email = ""

  try {
    const customerUser = JSON.parse(
      localStorage.getItem("customerUser") || "null"
    )

    email =
      customerUser?.email ||
      customerUser?.user?.email ||
      customerUser?.data?.email ||
      ""
  } catch {
    console.warn("⚠️ Failed to parse customerUser")
  }

  if (!email) {
    email =
      localStorage.getItem("customerEmail") || ""
  }

  return String(email).trim().toLowerCase()
}

const normalizeTickets = (payload) => {
  const data =
    payload?.data ||
    payload?.tickets ||
    payload?.supportTickets ||
    payload ||
    []

  const list = Array.isArray(data) ? data : []

  return [...list].sort(
    (a, b) =>
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
  )
}

const formatStatus = (status = "open") => {
  return String(status || "open")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const statusClass = (status = "open") => {
  const key = String(status || "open").toLowerCase()

  if (key === "resolved") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
  }

  if (key === "pending") {
    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
  }

  if (key === "closed") {
    return "border-slate-500/30 bg-slate-500/10 text-slate-300"
  }

  return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
}

export default function MySupport() {
  const navigate = useNavigate()

  const [tickets, setTickets] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  useEffect(() => {
    let mounted = true

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setError("")

        const email = getCustomerEmail()

        if (!email) {
          setTickets([])
          setError("Please log in again to view your support tickets.")
          return
        }

        console.log(
          "📧 CUSTOMER SUPPORT EMAIL:",
          email
        )

        const res = await api.get(
          `/support?email=${encodeURIComponent(email)}`
        )

        console.log(
          "🛟 CUSTOMER TICKETS:",
          res.data
        )

        if (!mounted) return

        setTickets(
          normalizeTickets(res.data)
        )
      } catch (err) {
        if (!mounted) return

        console.error(
          "❌ LOAD SUPPORT ERROR:",
          err
        )

        setTickets([])
        setError("Could not load support tickets.")
        toast.error("Support tickets failed to load")
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }, 0)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  const stats = useMemo(() => {
    const open = tickets.filter(
      (ticket) =>
        String(ticket.status || "open").toLowerCase() === "open"
    ).length

    const pending = tickets.filter(
      (ticket) =>
        String(ticket.status || "").toLowerCase() === "pending"
    ).length

    const resolved = tickets.filter(
      (ticket) =>
        String(ticket.status || "").toLowerCase() === "resolved"
    ).length

    return {
      total: tickets.length,
      open,
      pending,
      resolved
    }
  }, [tickets])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        Loading support...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-8 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
        >
          ← Back to Dashboard
        </button>

        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              Customer Support
            </p>

            <h1 className="text-4xl font-extrabold md:text-5xl">
              My Support Tickets
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              View support requests, replies, and ticket status updates from SignaVi Studio.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/support/create")}
            className="rounded-full bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
          >
            + New Ticket
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-red-500/40 bg-red-950/40 p-6 text-red-300">
            {error}
          </div>
        )}

        {!error && (
          <>
            <div className="mb-8 grid gap-5 md:grid-cols-4">
              <StatCard
                label="Total"
                value={stats.total}
                accent="text-cyan-300"
              />

              <StatCard
                label="Open"
                value={stats.open}
                accent="text-blue-300"
              />

              <StatCard
                label="Pending"
                value={stats.pending}
                accent="text-yellow-300"
              />

              <StatCard
                label="Resolved"
                value={stats.resolved}
                accent="text-emerald-300"
              />
            </div>

            {tickets.length === 0 ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-10 text-center shadow-xl shadow-black/20">
                <h2 className="mb-3 text-2xl font-bold">
                  No Tickets Found
                </h2>

                <p className="mb-6 text-slate-400">
                  When you start a support request, it will show up here.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/support/create")}
                  className="rounded-full bg-cyan-500 px-6 py-3 font-bold text-black transition hover:bg-cyan-400"
                >
                  Create Support Ticket
                </button>
              </div>
            ) : (
              <div className="grid gap-5">
                {tickets.map((ticket) => (
                  <TicketCard
                    key={ticket._id}
                    ticket={ticket}
                    navigate={navigate}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}

function TicketCard({
  ticket,
  navigate
}) {
  const status =
    ticket.status || "open"

  const replies =
    ticket.replies || []

  return (
    <article
      onClick={() => navigate(`/support/${ticket._id}`)}
      className="cursor-pointer rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20 transition hover:border-cyan-500"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.18em] text-slate-500">
            Ticket
          </p>

          <h2 className="text-2xl font-bold">
            {ticket.subject || "Support Ticket"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {ticket.createdAt
              ? new Date(ticket.createdAt).toLocaleDateString()
              : "No date"}
          </p>
        </div>

        <span
          className={`rounded-full border px-4 py-2 text-xs font-bold ${statusClass(status)}`}
        >
          {formatStatus(status)}
        </span>
      </div>

      <p className="mb-5 line-clamp-2 text-slate-400">
        {ticket.message || "No message provided."}
      </p>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <DetailBox
          label="Priority"
          value={ticket.priority || "Normal"}
        />

        <DetailBox
          label="Replies"
          value={replies.length}
        />

        <DetailBox
          label="Order"
          value={ticket.orderNumber || ticket.orderId || "Not linked"}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            navigate(`/support/${ticket._id}`)
          }}
          className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-300"
        >
          View Conversation
        </button>
      </div>
    </article>
  )
}

function StatCard({
  label,
  value,
  accent
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
      <p className="mb-2 text-sm text-slate-400">
        {label}
      </p>

      <h2 className={`text-3xl font-extrabold ${accent}`}>
        {value}
      </h2>
    </div>
  )
}

function DetailBox({
  label,
  value
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#020617] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-white">
        {value}
      </p>
    </div>
  )
}